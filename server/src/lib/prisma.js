const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const MAX_QUERY_ATTEMPTS = 3;

function isRetriableDbError(err) {
  const code = err?.code;
  const msg = String(err?.message || err || '');
  return (
    code === 'P1001' ||
    code === 'P1008' ||
    code === 'P1017' ||
    msg.includes('kind: Closed') ||
    msg.includes('Connection terminated') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Connection pool timeout') ||
    msg.includes('Server has closed the connection')
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  async function reconnectBase() {
    try {
      await base.$disconnect();
    } catch {
      // ignore
    }
    try {
      await base.$connect();
    } catch (err) {
      console.error('[prisma] reconnect failed:', err.message);
    }
  }

  async function runWithRetry(operation, attempt = 0) {
    try {
      return await operation();
    } catch (err) {
      if (!isRetriableDbError(err) || attempt >= MAX_QUERY_ATTEMPTS - 1) {
        throw err;
      }
      console.warn(
        `[prisma] retriable error (attempt ${attempt + 1}/${MAX_QUERY_ATTEMPTS}):`,
        err.message,
      );
      await reconnectBase();
      await delay(50 * (attempt + 1));
      return runWithRetry(operation, attempt + 1);
    }
  }

  return base.$extends({
    query: {
      $allOperations({ args, query }) {
        return runWithRetry(() => query(args));
      },
    },
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma, isRetriableDbError };
