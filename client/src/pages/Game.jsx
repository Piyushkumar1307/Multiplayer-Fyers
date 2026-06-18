import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  STOCKS,
  TOTAL_ROUNDS,
  TRADING_SECONDS,
  NEWS_EVENTS_PER_GAME,
} from '../lib/constants';
import { getPlayerId, isLoggedIn } from '../lib/auth';
import { getSocket } from '../lib/socket';
import { applyTrades } from '../lib/portfolio';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useSocketStatus } from '../hooks/useSocketStatus';
import { afterGameEnd } from '../lib/sessionFlow';
import StockCard from '../components/StockCard';
import NewsBanner from '../components/NewsBanner';
import TradePanel from '../components/TradePanel';
import TradeToast from '../components/TradeToast';
import Portfolio from '../components/Portfolio';
import Timer from '../components/Timer';
import { formatProfit } from '../lib/format';

function priceFlashes(previousPrices, currentPrices) {
  const flashes = {};
  for (const s of STOCKS) {
    if (currentPrices[s] > previousPrices[s]) flashes[s] = 'up';
    else if (currentPrices[s] < previousPrices[s]) flashes[s] = 'down';
  }
  return flashes;
}

function applyRoundPayload(payload, playerId, {
  setEndOverlay,
  setRoundNumber,
  setPhase,
  setSecondsLeft,
  setStatusMessage,
  applyServerPortfolio,
  applyNewsPrices,
}) {
  setEndOverlay(null);
  setRoundNumber(payload.roundNumber ?? 1);
  setPhase('trading');
  setSecondsLeft(payload.secondsLeft ?? TRADING_SECONDS);
  setStatusMessage('');
  const mine = payload.portfolios?.[playerId];
  if (mine) applyServerPortfolio(mine);
  if (payload.newsCard && payload.currentPrices) {
    applyNewsPrices({
      newsCard: payload.newsCard,
      newsIndex: payload.newsIndex,
      currentPrices: payload.currentPrices,
      previousPrices: payload.previousPrices || {},
    });
  }
}

export default function Game() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const playerId = getPlayerId();

  const goToLobbyAfterGame = useCallback(() => {
    afterGameEnd();
    navigate('/lobby', { replace: true });
  }, [navigate]);
  const socketConnected = useSocketStatus();
  useRoomSocket(roomCode, playerId, Boolean(roomCode && playerId));

  const [phase, setPhase] = useState('idle');
  const [roundNumber, setRoundNumber] = useState(0);
  const [newsCard, setNewsCard] = useState(null);
  const [newsIndex, setNewsIndex] = useState(0);
  const [prices, setPrices] = useState({});
  const [displayPrices, setDisplayPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [flash, setFlash] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TRADING_SECONDS);
  const [portfolio, setPortfolio] = useState(null);
  const [tradeError, setTradeError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [tradeToasts, setTradeToasts] = useState([]);
  const [endOverlay, setEndOverlay] = useState(null);

  const serverPortfolioRef = useRef(null);
  const portfolioRef = useRef(null);
  const gameEndTimerRef = useRef(null);
  const toastTimersRef = useRef(new Map());

  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  const applyServerPortfolio = useCallback((mine) => {
    if (!mine) return;
    serverPortfolioRef.current = mine;
    portfolioRef.current = mine;
    setPortfolio(mine);
  }, []);

  const applyNewsPrices = useCallback((payload) => {
    const prev = payload.previousPrices || {};
    const next = payload.currentPrices || {};
    setNewsCard(payload.newsCard);
    setNewsIndex(payload.newsIndex || 0);
    setPrevPrices(prev);
    setPrices(next);
    setDisplayPrices(next);
    setFlash(priceFlashes(prev, next));
    setTimeout(() => setFlash({}), 2500);
  }, []);

  const netWorth = useMemo(() => {
    if (!portfolio) return 0;
    const stockVal = STOCKS.reduce(
      (sum, s) => sum + (portfolio.portfolio?.[s] || 0) * (prices[s] || 0),
      0,
    );
    return (portfolio.cash || 0) + stockVal;
  }, [portfolio, prices]);

  const pushTradeToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTradeToasts((prev) => [...prev.slice(-2), { id, ...toast }]);
    const timer = window.setTimeout(() => {
      setTradeToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current.delete(id);
    }, 2400);
    toastTimersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  const handleTrade = useCallback(
    (stock, action, quantity) => {
      setTradeError('');
      const current = portfolioRef.current;
      if (!current) return;

      try {
        const result = applyTrades({
          cash: current.cash,
          portfolio: current.portfolio,
          trades: [{ stock, action, quantity }],
          prices,
        });
        const next = { ...current, cash: result.cash, portfolio: result.portfolio };
        portfolioRef.current = next;
        setPortfolio(next);
        pushTradeToast({
          stock,
          action,
          quantity,
          price: prices[stock] || 100,
        });
        getSocket().emit(action === 'BUY' ? 'buyStock' : 'sellStock', {
          roomCode,
          playerId,
          stock,
          quantity,
        });
      } catch (err) {
        setTradeError(err.message);
      }
    },
    [prices, roomCode, playerId, pushTradeToast],
  );

  const handleBuy = useCallback(
    (stock, quantity) => handleTrade(stock, 'BUY', quantity),
    [handleTrade],
  );

  const handleSell = useCallback(
    (stock, quantity) => handleTrade(stock, 'SELL', quantity),
    [handleTrade],
  );

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/register', { replace: true });
      return;
    }

    const socket = getSocket();

    const onRound = (payload) => {
      applyRoundPayload(payload, playerId, {
        setEndOverlay,
        setRoundNumber,
        setPhase,
        setSecondsLeft,
        setStatusMessage,
        applyServerPortfolio,
        applyNewsPrices,
      });
    };

    const onNewsUpdate = (payload) => {
      applyNewsPrices(payload);
    };

    const onPortfolioUpdated = ({ portfolios }) => {
      applyServerPortfolio(portfolios?.[playerId]);
    };

    const onTradeConfirmed = ({ portfolio }) => {
      applyServerPortfolio(portfolio);
    };

    const onTimerTick = ({ secondsLeft: s }) => {
      setSecondsLeft(s);
    };

    const onMarketsClosing = ({ message }) => {
      setPhase('closing');
      setStatusMessage(message);
    };

    const onTradeError = ({ message }) => {
      if (serverPortfolioRef.current) {
        portfolioRef.current = serverPortfolioRef.current;
        setPortfolio(serverPortfolioRef.current);
      }
      setTradeError(message);
    };

    const onGameEnd = ({ leaderboard, winner }) => {
      setPhase('ended');
      setEndOverlay({ leaderboard, winner });
      if (gameEndTimerRef.current) window.clearTimeout(gameEndTimerRef.current);
      gameEndTimerRef.current = window.setTimeout(() => {
        goToLobbyAfterGame();
      }, 5000);
    };

    const onGameStart = () => {
      setStatusMessage('');
    };

    socket.on('roundStart', onRound);
    socket.on('gameSync', onRound);
    socket.on('newsUpdate', onNewsUpdate);
    socket.on('portfolioUpdated', onPortfolioUpdated);
    socket.on('tradeConfirmed', onTradeConfirmed);
    socket.on('timerTick', onTimerTick);
    socket.on('marketsClosing', onMarketsClosing);
    socket.on('tradeError', onTradeError);
    socket.on('gameEnd', onGameEnd);
    socket.on('gameStart', onGameStart);

    return () => {
      if (gameEndTimerRef.current) window.clearTimeout(gameEndTimerRef.current);
      socket.off('roundStart', onRound);
      socket.off('gameSync', onRound);
      socket.off('newsUpdate', onNewsUpdate);
      socket.off('portfolioUpdated', onPortfolioUpdated);
      socket.off('tradeConfirmed', onTradeConfirmed);
      socket.off('timerTick', onTimerTick);
      socket.off('marketsClosing', onMarketsClosing);
      socket.off('tradeError', onTradeError);
      socket.off('gameEnd', onGameEnd);
      socket.off('gameStart', onGameStart);
    };
  }, [
    navigate,
    playerId,
    roomCode,
    applyNewsPrices,
    applyServerPortfolio,
    goToLobbyAfterGame,
  ]);

  const tradingOpen = phase === 'trading';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-950 text-white w-full">
      <NewsBanner
        headline={newsCard?.headline}
        newsIndex={newsIndex}
        totalNews={NEWS_EVENTS_PER_GAME}
      />

      <header className="shrink-0 z-40 border-b border-slate-800 bg-slate-950 px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase">
              Round {roundNumber}/{TOTAL_ROUNDS}
            </p>
            <p className="font-mono text-sm text-indigo-400 truncate">{roomCode}</p>
          </div>
        </div>
        {(tradingOpen || phase === 'closing') && (
          <Timer seconds={secondsLeft} total={TRADING_SECONDS} />
        )}
        {statusMessage && (
          <p className="mt-2 text-center text-amber-400 text-xs animate-pulse">
            {statusMessage}
          </p>
        )}
        {tradeError && (
          <p className="mt-1 text-center text-red-400 text-xs">{tradeError}</p>
        )}
        {!socketConnected && tradingOpen && (
          <p className="mt-2 text-center text-amber-300 text-xs animate-pulse">
            Reconnecting… keep this tab open
          </p>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-3 py-3 sm:px-4 pb-40 space-y-4 [webkit-overflow-scrolling:touch]">
        {phase === 'idle' && (
          <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/50 px-4 py-10 text-center">
            <p className="text-amber-300 font-semibold mb-2">Waiting for game to start</p>
            <p className="text-slate-400 text-sm">
              The admin will start when enough players have joined. Keep this screen open.
            </p>
          </div>
        )}

        {(tradingOpen || phase === 'closing') && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {STOCKS.map((s) => (
              <StockCard
                key={s}
                stock={s}
                price={displayPrices[s] ?? prices[s] ?? 100}
                previousPrice={prevPrices[s]}
                flash={flash[s]}
              />
            ))}
          </div>
        )}

        {portfolio && tradingOpen && (
          <div className="space-y-2 pb-4">
            {STOCKS.map((s) => (
              <TradePanel
                key={s}
                stock={s}
                price={prices[s] || 100}
                shares={portfolio.portfolio?.[s] || 0}
                cash={portfolio.cash}
                disabled={!tradingOpen}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            ))}
            <p className="text-center text-[11px] text-slate-500 px-2">
              Buy & sell on each headline — unsold shares auto-sell when time ends
            </p>
          </div>
        )}
      </main>

      {portfolio && tradingOpen && (
        <footer className="shrink-0 z-40 border-t border-slate-700 bg-slate-900/95 backdrop-blur px-3 py-3 safe-bottom">
          <Portfolio
            compact
            cash={portfolio.cash}
            portfolio={portfolio.portfolio}
            prices={prices}
            netWorth={netWorth}
          />
        </footer>
      )}

      {tradingOpen && <TradeToast toasts={tradeToasts} />}

      {endOverlay && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-4 safe-bottom">
          <div className="w-full max-w-sm rounded-2xl border border-amber-500/40 bg-slate-900 p-5 text-center animate-[fadeIn_0.4s_ease-out]">
            <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">
              Round over
            </p>
            <p className="text-lg font-bold text-white mb-1">
              🏆 {endOverlay.winner?.name}
            </p>
            <p className="text-emerald-400 font-mono text-sm mb-4">
              {formatProfit(endOverlay.winner?.delta)}
            </p>
            <p className="text-xs text-slate-400 animate-pulse">
              Returning to room…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
