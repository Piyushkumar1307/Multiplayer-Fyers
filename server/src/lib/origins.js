function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

function parseOrigins(...values) {
  const seen = new Set();
  const out = [];

  for (const value of values) {
    for (const part of String(value || '').split(',')) {
      const origin = stripTrailingSlash(part.trim());
      if (origin && !seen.has(origin)) {
        seen.add(origin);
        out.push(origin);
      }
    }
  }

  return out;
}

function isLocalhostOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === 'http:' || protocol === 'https:') &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

function buildAllowedOrigins(isProd) {
  return parseOrigins(
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.ALLOWED_ORIGINS,
    !isProd ? 'http://localhost:5173' : null,
    !isProd ? 'http://localhost:5174' : null,
    !isProd ? 'http://localhost:5175' : null,
  );
}

function createOriginChecker(allowedOrigins) {
  return function isAllowedOrigin(origin) {
    if (!origin) return true;
    const normalized = stripTrailingSlash(origin);
    if (allowedOrigins.includes(normalized)) return true;
    // Always allow local dev (e.g. client on :5173 hitting Render API)
    if (isLocalhostOrigin(normalized)) return true;
    return false;
  };
}

module.exports = {
  stripTrailingSlash,
  parseOrigins,
  buildAllowedOrigins,
  createOriginChecker,
};
