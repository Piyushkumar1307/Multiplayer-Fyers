const { prisma } = require('../lib/prisma');

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
      'startGame',
      safeHandler(socket, 'startGame', async (payload) => {
        const { roomCode, playerId } = payload || {};
        const pid = playerId || socket.data.playerId;
        if (!roomCode || !pid) return;

        const code = String(roomCode).toUpperCase();
        const room = await prisma.room.findUnique({ where: { code } });
        if (!room || room.hostId !== pid) return;

        await gameManager.tryStartGame(code, pid);
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
