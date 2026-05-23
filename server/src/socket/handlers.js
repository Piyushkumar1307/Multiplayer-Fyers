const { prisma } = require('../lib/prisma');
const { verifyAdminToken } = require('../middleware/adminAuth');

function safeHandler(socket, eventName, handler) {
  return async (payload) => {
    try {
      await handler(payload, socket);
    } catch (err) {
      console.error(`[socket] ${eventName}:`, err);
      socket.emit('error', { message: 'Something went wrong. Please try again.' });
    }
  };
}

function registerSocketHandlers(io, gameManager) {
  io.on('connection', (socket) => {
    socket.on(
      'joinRoom',
      safeHandler(socket, 'joinRoom', async (payload) => {
        const { roomCode, playerId } = payload || {};
        if (!roomCode || !playerId) return;
        await gameManager.joinRoom(socket, { roomCode, playerId });
      }),
    );

    socket.on(
      'adminConnect',
      safeHandler(socket, 'adminConnect', async (payload) => {
        const { adminToken } = payload || {};
        if (!verifyAdminToken(adminToken)) {
          socket.emit('adminError', { message: 'Unauthorized' });
          return;
        }
        socket.join('admin:dashboard');
      }),
    );

    socket.on(
      'adminSubscribe',
      safeHandler(socket, 'adminSubscribe', async (payload) => {
        const { roomCode, adminToken } = payload || {};
        if (!roomCode || !verifyAdminToken(adminToken)) {
          socket.emit('adminError', { message: 'Unauthorized' });
          return;
        }

        const code = String(roomCode).trim().toUpperCase();
        socket.join(`admin:${code}`);
        socket.data.adminRoom = code;

        const standings = await gameManager.fetchStandings(code);
        const game = gameManager.getGame(code);
        socket.emit('standingsUpdated', {
          roomCode: code,
          phase: game?.phase || null,
          standings: standings || [],
          playerCount: standings?.length ?? 0,
          updatedAt: new Date().toISOString(),
        });
      }),
    );

    socket.on('registerPlayer', (payload) => {
      if (payload?.playerId) {
        socket.data.playerId = payload.playerId;
      }
    });

    socket.on(
      'buyStock',
      safeHandler(socket, 'buyStock', async (payload) => {
        const { roomCode, playerId, stock, quantity } = payload || {};
        const pid = playerId || socket.data.playerId;
        if (!roomCode || !pid || !stock) return;

        const result = await gameManager.buyStock(
          String(roomCode).toUpperCase(),
          pid,
          stock,
          quantity,
        );
        if (result?.error) {
          socket.emit('tradeError', { message: result.error });
        }
      }),
    );

    socket.on(
      'sellStock',
      safeHandler(socket, 'sellStock', async (payload) => {
        const { roomCode, playerId, stock, quantity } = payload || {};
        const pid = playerId || socket.data.playerId;
        if (!roomCode || !pid || !stock) return;

        const result = await gameManager.sellStock(
          String(roomCode).toUpperCase(),
          pid,
          stock,
          quantity,
        );
        if (result?.error) {
          socket.emit('tradeError', { message: result.error });
        }
      }),
    );

    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;
      if (playerId) gameManager.handleDisconnect(playerId);
    });
  });
}

module.exports = { registerSocketHandlers };
