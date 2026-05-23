const { prisma } = require('../lib/prisma');
const { getNewsCards } = require('../lib/newsCache');
const {
  STOCKS,
  TOTAL_ROUNDS,
  TRADING_SECONDS,
  NEWS_EVENTS_PER_GAME,
  MAX_PLAYERS,
  MIN_PLAYERS_TO_START,
  STARTING_CASH,
} = require('../constants/stocks');
const {
  initialPrices,
  normalizePortfolio,
  netWorth,
  applyTrades,
  autoSellAll,
  emptyPortfolio,
} = require('../lib/portfolio');
const { applyPriceDeltas } = require('../lib/prices');

function formatNewsCard(newsCard) {
  return {
    id: newsCard.id,
    headline: newsCard.headline,
    affectedStocks: newsCard.affectedStocks,
    priceDeltas: newsCard.priceDeltas,
  };
}

function normalizeRoomCode(roomCode) {
  return String(roomCode || '').trim().toUpperCase();
}

class GameManager {
  constructor(io) {
    this.io = io;
    /** @type {Map<string, object>} */
    this.activeGames = new Map();
    /** @type {Map<string, string>} */
    this.playerRoom = new Map();
    /** @type {Map<string, Promise>} */
    this.startLocks = new Map();
    /** @type {Map<string, Promise>} */
    this.tradeLocks = new Map();
  }

  getActiveRoomCount() {
    return this.activeGames.size;
  }

  getGame(roomCode) {
    return this.activeGames.get(normalizeRoomCode(roomCode));
  }

  bumpEpoch(game) {
    game.epoch = (game.epoch || 0) + 1;
    return game.epoch;
  }

  isEpochValid(game, epoch) {
    return game && game.epoch === epoch;
  }

  clearTimers(game) {
    for (const t of game.timers) clearTimeout(t);
    for (const i of game.intervals || []) clearInterval(i);
    game.timers = [];
    game.intervals = [];
  }

  scheduleTimer(game, fn, delayMs) {
    const epoch = game.epoch;
    const roomCode = game.roomCode;
    const timer = setTimeout(() => {
      const current = this.activeGames.get(roomCode);
      if (!this.isEpochValid(current, epoch)) return;
      Promise.resolve(fn(current)).catch((err) =>
        console.error(`[${roomCode}] timer error:`, err),
      );
    }, delayMs);
    game.timers.push(timer);
    return timer;
  }

  async withTradeLock(roomCode, fn) {
    const code = normalizeRoomCode(roomCode);
    const previous = this.tradeLocks.get(code) || Promise.resolve();
    const next = previous
      .catch(() => {})
      .then(() => fn())
      .finally(() => {
        if (this.tradeLocks.get(code) === next) {
          this.tradeLocks.delete(code);
        }
      });
    this.tradeLocks.set(code, next);
    return next;
  }

  async withStartLock(roomCode, fn) {
    const code = normalizeRoomCode(roomCode);
    if (this.startLocks.has(code)) {
      return this.startLocks.get(code);
    }
    const promise = Promise.resolve()
      .then(() => fn())
      .finally(() => {
        if (this.startLocks.get(code) === promise) {
          this.startLocks.delete(code);
        }
      });
    this.startLocks.set(code, promise);
    return promise;
  }

  async buildPortfoliosSnapshot(game) {
    const roomPlayers = await prisma.roomPlayer.findMany({
      where: { roomId: game.roomId },
      include: { player: { select: { id: true, name: true } } },
    });

    const portfolios = {};
    for (const rp of roomPlayers) {
      portfolios[rp.player.id] = {
        name: rp.player.name,
        cash: rp.cash,
        portfolio: normalizePortfolio(rp.portfolio),
        netWorth: netWorth(rp.cash, rp.portfolio, game.prices),
      };
    }
    return portfolios;
  }

  async emitPortfolioUpdate(roomCode) {
    const game = this.getGame(roomCode);
    if (!game || game.phase !== 'trading') return;
    try {
      await this.persistStandings(roomCode);
      const portfolios = await this.buildPortfoliosSnapshot(game);
      this.io.to(game.roomCode).emit('portfolioUpdated', { portfolios });
      await this.emitAdminStandings(roomCode);
    } catch (err) {
      console.error(`[${roomCode}] portfolio update:`, err);
    }
  }

  async buildRoomPlayers(roomId) {
    const rows = await prisma.roomPlayer.findMany({
      where: { roomId },
      include: { player: { select: { id: true, name: true } } },
      orderBy: { joinedAt: 'asc' },
    });
    return rows.map((rp) => ({
      id: rp.player.id,
      name: rp.player.name,
      cash: rp.cash,
      portfolio: normalizePortfolio(rp.portfolio),
    }));
  }

  async resetRoomPlayers(roomId) {
    await prisma.roomPlayer.updateMany({
      where: { roomId },
      data: {
        cash: STARTING_CASH,
        portfolio: emptyPortfolio(),
        netWorth: STARTING_CASH,
        profitLoss: 0,
      },
    });
  }

  buildStandingsFromRows(roomPlayers, prices) {
    const sorted = [...roomPlayers].sort((a, b) => {
      const aWorth = prices
        ? netWorth(a.cash, a.portfolio, prices)
        : a.netWorth;
      const bWorth = prices
        ? netWorth(b.cash, b.portfolio, prices)
        : b.netWorth;
      return bWorth - aWorth;
    });

    return sorted.map((rp, index) => {
      const player = rp.player || {};
      const worth = prices
        ? netWorth(rp.cash, rp.portfolio, prices)
        : rp.netWorth;
      const pl = prices ? worth - STARTING_CASH : rp.profitLoss;

      return {
        rank: index + 1,
        playerId: player.id || rp.playerId,
        name: player.name || 'Unknown',
        phone: player.phone || null,
        cash: rp.cash,
        netWorth: worth,
        profitLoss: pl,
        portfolio: normalizePortfolio(rp.portfolio),
      };
    });
  }

  async fetchStandings(roomCode) {
    const code = normalizeRoomCode(roomCode);
    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: {
          include: { player: { select: { id: true, name: true, phone: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!room) return null;

    const game = this.getGame(code);
    return this.buildStandingsFromRows(room.players, game?.prices);
  }

  async persistStandings(roomCode) {
    const game = this.getGame(roomCode);
    if (!game) return;

    const roomPlayers = await prisma.roomPlayer.findMany({
      where: { roomId: game.roomId },
    });

    await Promise.all(
      roomPlayers.map((rp) => {
        const worth = netWorth(rp.cash, rp.portfolio, game.prices);
        return prisma.roomPlayer.update({
          where: { id: rp.id },
          data: {
            netWorth: worth,
            profitLoss: worth - STARTING_CASH,
          },
        });
      }),
    );
  }

  async emitAdminStandings(roomCode) {
    const code = normalizeRoomCode(roomCode);
    try {
      const standings = await this.fetchStandings(code);
      if (!standings) return;

      const game = this.getGame(code);
      this.io.to(`admin:${code}`).emit('standingsUpdated', {
        roomCode: code,
        phase: game?.phase || null,
        standings,
        playerCount: standings.length,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[${code}] admin standings:`, err);
    }
  }

  async nextDbRoundNumber(roomId) {
    const lastRound = await prisma.gameRound.findFirst({
      where: { roomId },
      orderBy: { roundNumber: 'desc' },
      select: { roundNumber: true },
    });
    return (lastRound?.roundNumber ?? 0) + 1;
  }

  async emitRoomUpdated(roomCode) {
    const code = normalizeRoomCode(roomCode);
    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) return;
    const players = await this.buildRoomPlayers(room.id);
    this.io.to(code).emit('roomUpdated', { players });
    await this.emitAdminStandings(code);
  }

  async joinRoom(socket, { roomCode, playerId }) {
    const code = normalizeRoomCode(roomCode);
    const room = await prisma.room.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const membership = room.players.find((p) => p.playerId === playerId);
    if (!membership) {
      socket.emit('error', { message: 'Join the room via API first' });
      return;
    }

    socket.join(code);
    this.playerRoom.set(playerId, code);

    const game = this.getGame(code);
    if (game) {
      game.connections.set(playerId, socket.id);
    }

    await this.emitRoomUpdated(code);
  }

  async startGameAsAdmin(roomCode) {
    const code = normalizeRoomCode(roomCode);
    return this.withStartLock(code, () => this.startGameInternal(code, { asAdmin: true }));
  }

  async tryStartGame(roomCode, hostId) {
    const code = normalizeRoomCode(roomCode);
    return this.withStartLock(code, () => this.startGameInternal(code, { hostId }));
  }

  async startGameInternal(roomCode, { hostId, asAdmin = false } = {}) {
    const code = normalizeRoomCode(roomCode);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!room) return asAdmin ? { error: 'Room not found' } : undefined;
    if (!asAdmin && room.hostId !== hostId) return undefined;
    if (room.status === 'ENDED') {
      return asAdmin ? { error: 'This room has already ended' } : undefined;
    }
    if (room.status !== 'WAITING') {
      return asAdmin ? { error: 'Room is not waiting for players' } : undefined;
    }
    if (room.players.length < MIN_PLAYERS_TO_START) {
      return asAdmin
        ? { error: `Need at least ${MIN_PLAYERS_TO_START} players` }
        : undefined;
    }
    if (this.activeGames.has(code)) {
      return asAdmin ? { error: 'Game already in progress' } : undefined;
    }

    await this.resetRoomPlayers(room.id);

    await prisma.room.update({
      where: { id: room.id },
      data: { status: 'ACTIVE' },
    });

    const game = {
      roomCode: code,
      roomId: room.id,
      sessionRound: 0,
      roundId: null,
      roundInitPromise: null,
      prices: initialPrices(),
      usedNewsIds: new Set(),
      phase: 'idle',
      connections: new Map(),
      timers: [],
      intervals: [],
      newsIndex: 0,
      epoch: 0,
    };

    this.activeGames.set(code, game);
    this.io.to(code).emit('gameStart', { roomCode: code });

    try {
      await this.runRound(code);
      if (asAdmin) return { ok: true };
    } catch (err) {
      console.error(`[${code}] runRound failed:`, err);
      this.teardownGame(code, room.id);
      this.io.to(code).emit('error', {
        message: 'Failed to start round. Please try again.',
      });
      if (asAdmin) return { error: 'Failed to start round' };
    }
  }

  async teardownGame(roomCode, roomId) {
    const code = normalizeRoomCode(roomCode);
    const game = this.getGame(code);
    if (game) {
      this.bumpEpoch(game);
      this.clearTimers(game);
      this.activeGames.delete(code);
    }
    try {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'WAITING' },
      });
    } catch (err) {
      console.error(`[${code}] teardown room status:`, err);
    }
  }

  async pickNewsCard(game) {
    const all = await getNewsCards();
    if (!all.length) {
      throw new Error('No news cards in database. Run npm run db:seed');
    }
    const available = all.filter((c) => !game.usedNewsIds.has(c.id));
    const pool = available.length > 0 ? available : all;
    const card = pool[Math.floor(Math.random() * pool.length)];
    game.usedNewsIds.add(card.id);
    return card;
  }

  scheduleNewsAndTimer(roomCode) {
    const game = this.getGame(roomCode);
    if (!game) return;

    const stepMs = Math.floor((TRADING_SECONDS * 1000) / NEWS_EVENTS_PER_GAME);

    for (let i = 0; i < NEWS_EVENTS_PER_GAME; i += 1) {
      this.scheduleTimer(game, () => this.publishNews(roomCode, i), i * stepMs);
    }

    let secondsLeft = TRADING_SECONDS;
    this.io.to(game.roomCode).emit('timerTick', { secondsLeft });

    const interval = setInterval(() => {
      const current = this.getGame(roomCode);
      if (!current || current.phase !== 'trading') {
        clearInterval(interval);
        return;
      }
      secondsLeft -= 1;
      if (secondsLeft >= 0) {
        this.io.to(current.roomCode).emit('timerTick', { secondsLeft });
      }
    }, 1000);
    game.intervals.push(interval);

    this.scheduleTimer(
      game,
      () => this.finishRound(roomCode),
      TRADING_SECONDS * 1000,
    );
  }

  async ensureGameRound(game) {
    if (game.roundId) return;

    if (!game.roundInitPromise) {
      game.roundInitPromise = (async () => {
        const dbRoundNumber = await this.nextDbRoundNumber(game.roomId);
        const stubCard = await prisma.newsCard.findFirst({
          orderBy: { id: 'asc' },
        });
        if (!stubCard) {
          throw new Error('No news cards in database. Run npm run db:seed');
        }

        const round = await prisma.gameRound.create({
          data: {
            roomId: game.roomId,
            roundNumber: dbRoundNumber,
            newsCardId: stubCard.id,
            stockPrices: game.prices,
          },
        });
        game.roundId = round.id;
      })();
    }

    try {
      await game.roundInitPromise;
    } catch (err) {
      game.roundInitPromise = null;
      throw err;
    }
  }

  async publishNews(roomCode, newsIndex) {
    const game = this.getGame(roomCode);
    if (!game || game.phase !== 'trading' || !game.roundId) return;

    try {
      const newsCard = await this.pickNewsCard(game);
      const previousPrices = { ...game.prices };
      game.prices = applyPriceDeltas(game.prices, newsCard.priceDeltas);
      game.newsCard = newsCard;
      game.newsIndex = newsIndex;

      await prisma.gameRound.update({
        where: { id: game.roundId },
        data: { stockPrices: game.prices, newsCardId: newsCard.id },
      });

      const newsPayload = {
        newsIndex: newsIndex + 1,
        totalNews: NEWS_EVENTS_PER_GAME,
        newsCard: formatNewsCard(newsCard),
        currentPrices: { ...game.prices },
        previousPrices,
      };

      if (newsIndex === 0) {
        const portfolios = await this.buildPortfoliosSnapshot(game);
        this.io.to(game.roomCode).emit('roundStart', {
          roundNumber: game.sessionRound,
          timeLimit: TRADING_SECONDS,
          portfolios,
          ...newsPayload,
        });
      } else {
        this.io.to(game.roomCode).emit('newsUpdate', newsPayload);
      }

      await this.persistStandings(roomCode);
      await this.emitPortfolioUpdate(game.roomCode);
    } catch (err) {
      console.error(`[${roomCode}] publishNews:`, err);
    }
  }

  async runRound(roomCode) {
    const game = this.getGame(roomCode);
    if (!game) return;

    game.sessionRound += 1;
    if (game.sessionRound > TOTAL_ROUNDS) {
      await this.endGame(roomCode);
      return;
    }

    this.bumpEpoch(game);
    this.clearTimers(game);
    game.phase = 'trading';
    game.prices = initialPrices();
    game.roundId = null;
    game.roundInitPromise = null;

    await this.ensureGameRound(game);
    this.scheduleNewsAndTimer(roomCode);
  }

  async executeStockTrade(roomCode, playerId, stock, action, quantity = 1) {
    return this.withTradeLock(roomCode, async () => {
      const game = this.getGame(roomCode);
      if (!game || game.phase !== 'trading') {
        return { error: 'Trading is not active' };
      }
      if (!game.roundId) {
        return { error: 'Round is not ready yet' };
      }
      if (!STOCKS.includes(stock)) {
        return { error: 'Invalid stock' };
      }
      if (!['BUY', 'SELL'].includes(action)) {
        return { error: 'Invalid action' };
      }

      const qty = Math.max(1, Math.floor(Number(quantity) || 1));

      const rp = await prisma.roomPlayer.findFirst({
        where: { roomId: game.roomId, playerId },
      });
      if (!rp) return { error: 'Player not in room' };

      try {
        const result = applyTrades({
          cash: rp.cash,
          portfolio: rp.portfolio,
          trades: [{ stock, action, quantity: qty }],
          prices: game.prices,
        });

        await prisma.roomPlayer.update({
          where: { id: rp.id },
          data: { cash: result.cash, portfolio: result.portfolio },
        });

        await this.emitPortfolioUpdate(roomCode);
        return { ok: true };
      } catch (err) {
        return { error: err.message };
      }
    });
  }

  async buyStock(roomCode, playerId, stock, quantity = 1) {
    return this.executeStockTrade(roomCode, playerId, stock, 'BUY', quantity);
  }

  async sellStock(roomCode, playerId, stock, quantity = 1) {
    return this.executeStockTrade(roomCode, playerId, stock, 'SELL', quantity);
  }

  async finishRound(roomCode) {
    const game = this.getGame(roomCode);
    if (!game || game.phase !== 'trading' || !game.roundId) return;

    game.phase = 'closing';
    this.clearTimers(game);

    try {
      this.io.to(game.roomCode).emit('marketsClosing', {
        message: 'Time up! Auto-selling any remaining holdings…',
      });

      const tradePrices = { ...game.prices };
      const roomPlayers = await prisma.roomPlayer.findMany({
        where: { roomId: game.roomId },
      });

      await Promise.all(
        roomPlayers.map((rp) => {
          const sold = autoSellAll(rp.cash, rp.portfolio, tradePrices);
          const worth = sold.cash;
          return prisma.roomPlayer.update({
            where: { id: rp.id },
            data: {
              cash: sold.cash,
              portfolio: sold.portfolio,
              netWorth: worth,
              profitLoss: worth - STARTING_CASH,
            },
          });
        }),
      );

      await this.emitAdminStandings(roomCode);

      await prisma.gameRound.update({
        where: { id: game.roundId },
        data: { stockPrices: game.prices },
      });

      this.scheduleTimer(game, () => this.endGame(roomCode), 2500);
    } catch (err) {
      console.error(`[${roomCode}] finishRound:`, err);
      await this.endGame(roomCode);
    }
  }

  async endGame(roomCode) {
    const code = normalizeRoomCode(roomCode);
    const game = this.getGame(code);
    if (!game || game.phase === 'ended') return;

    game.phase = 'ended';
    this.bumpEpoch(game);
    this.clearTimers(game);

    try {
      const players = await prisma.roomPlayer.findMany({
        where: { roomId: game.roomId },
        include: { player: { select: { id: true, name: true } } },
      });

      const leaderboard = players
        .map((rp) => {
          const finalCash = rp.cash;
          const delta = rp.profitLoss ?? finalCash - STARTING_CASH;
          return {
            playerId: rp.player.id,
            name: rp.player.name,
            netWorth: finalCash,
            delta,
          };
        })
        .sort((a, b) => b.delta - a.delta)
        .map((entry, i) => ({ ...entry, rank: i + 1 }));

      const winner = leaderboard[0] || null;
      const payload = { leaderboard, winner };

      await prisma.room.update({
        where: { id: game.roomId },
        data: {
          status: 'ENDED',
          winnerId: winner?.playerId || null,
          winnerName: winner?.name || null,
          winnerProfitLoss: winner?.delta ?? null,
          closedAt: new Date(),
        },
      });

      await this.emitAdminStandings(code);
      this.io.to(`admin:${code}`).emit('gameEnded', {
        roomCode: code,
        leaderboard,
        winner,
      });

      this.io.to('admin:dashboard').emit('adminPanelRefresh', {
        roomCode: code,
        winner,
        leaderboard,
      });

      this.io.to(code).emit('gameEnd', payload);

      const returnEpoch = game.epoch;
      setTimeout(() => {
        if (this.getGame(code)) return;
        this.io.to(code).emit('returnToLobby', payload);
      }, 5000);
    } catch (err) {
      console.error(`[${code}] endGame:`, err);
    } finally {
      this.activeGames.delete(code);
      this.tradeLocks.delete(code);
      this.startLocks.delete(code);
    }
  }

  handleDisconnect(playerId) {
    this.playerRoom.delete(playerId);
  }

  async deleteAllRooms() {
    for (const [code, game] of this.activeGames.entries()) {
      this.bumpEpoch(game);
      this.clearTimers(game);
      this.io.to(code).emit('roomClosed', {
        message: 'This room was removed by admin.',
      });
    }

    this.activeGames.clear();
    this.tradeLocks.clear();
    this.startLocks.clear();
    this.playerRoom.clear();

    const result = await prisma.room.deleteMany({});
    return { deletedCount: result.count };
  }
}

module.exports = { GameManager };
