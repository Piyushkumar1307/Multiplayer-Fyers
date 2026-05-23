export function formatUnits(value) {
  const n = Number(value) || 0;
  return `${n.toLocaleString('en-IN')} unit`;
}

export function formatSignedUnits(value) {
  const n = Number(value) || 0;
  if (n >= 0) return `+${n.toLocaleString('en-IN')} unit`;
  return `-${Math.abs(n).toLocaleString('en-IN')} unit`;
}

export function formatProfit(value) {
  return `${formatSignedUnits(value)} profit`;
}
