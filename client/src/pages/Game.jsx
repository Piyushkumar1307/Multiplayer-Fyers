import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  STOCKS,
  TOTAL_ROUNDS,
  TRADING_SECONDS,
  NEWS_EVENTS_PER_GAME,
} from '../lib/constants';
import { getPlayerId, isLoggedIn } from '../lib/auth';
import { getSocket, registerSocketPlayer } from '../lib/socket';
import StockCard from '../components/StockCard';
import NewsBanner from '../components/NewsBanner';
import TradePanel from '../components/TradePanel';
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

export default function Game() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const playerId = getPlayerId();

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
  const [endOverlay, setEndOverlay] = useState(null);

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

  const handleBuy = useCallback(
    (stock, quantity) => {
      setTradeError('');
      getSocket().emit('buyStock', { roomCode, playerId, stock, quantity });
    },
    [roomCode, playerId],
  );

  const handleSell = useCallback(
    (stock, quantity) => {
      setTradeError('');
      getSocket().emit('sellStock', { roomCode, playerId, stock, quantity });
    },
    [roomCode, playerId],
  );

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/', { replace: true });
      return;
    }

    registerSocketPlayer(playerId);
    const socket = getSocket();
    socket.emit('joinRoom', { roomCode, playerId });

    socket.on('roundStart', (payload) => {
      setEndOverlay(null);
      setRoundNumber(payload.roundNumber);
      setPhase('trading');
      setSecondsLeft(TRADING_SECONDS);
      setStatusMessage('');
      const mine = payload.portfolios?.[playerId];
      if (mine) setPortfolio(mine);
      applyNewsPrices(payload);
    });

    socket.on('newsUpdate', (payload) => {
      applyNewsPrices(payload);
    });

    socket.on('portfolioUpdated', ({ portfolios }) => {
      const mine = portfolios?.[playerId];
      if (mine) setPortfolio(mine);
    });

    socket.on('timerTick', ({ secondsLeft: s }) => {
      setSecondsLeft(s);
    });

    socket.on('marketsClosing', ({ message }) => {
      setPhase('closing');
      setStatusMessage(message);
    });

    socket.on('tradeError', ({ message }) => {
      setTradeError(message);
    });

    socket.on('gameEnd', ({ leaderboard, winner }) => {
      setPhase('ended');
      setEndOverlay({ leaderboard, winner });
    });

    return () => {
      socket.off('roundStart');
      socket.off('newsUpdate');
      socket.off('portfolioUpdated');
      socket.off('timerTick');
      socket.off('marketsClosing');
      socket.off('tradeError');
      socket.off('gameEnd');
    };
  }, [navigate, playerId, roomCode, applyNewsPrices]);

  const tradingOpen = phase === 'trading';

  return (
    <div className="min-h-svh min-h-dvh bg-slate-950 text-white flex flex-col max-w-lg mx-auto w-full lg:max-w-2xl">
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
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 pb-28 space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
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

        {portfolio && tradingOpen && (
          <div className="space-y-2">
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
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 bg-slate-900/95 backdrop-blur px-3 py-3 safe-bottom max-w-lg mx-auto lg:max-w-2xl">
          <Portfolio
            compact
            cash={portfolio.cash}
            portfolio={portfolio.portfolio}
            prices={prices}
            netWorth={netWorth}
          />
        </footer>
      )}

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
              Everyone returns to lobby shortly…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
