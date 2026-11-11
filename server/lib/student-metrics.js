function dateOnly(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10);
}

function streakMetrics(values) {
  const days = [...new Set(values.map(dateOnly).filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let current = 0, best = 0, expected = null;
  for (const day of days) {
    if (!expected) {
      if (day !== today && day !== yesterday) break;
      current = 1;
      expected = new Date(`${day}T00:00:00.000Z`).getTime() - 86400000;
      continue;
    }
    if (new Date(`${day}T00:00:00.000Z`).getTime() === expected) { current += 1; expected -= 86400000; }
    else break;
  }
  let run = 0, previous = null;
  for (const day of [...days].sort()) {
    const numeric = new Date(`${day}T00:00:00.000Z`).getTime();
    run = previous != null && numeric - previous === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = numeric;
  }
  return { current_streak: current, best_streak: best };
}

module.exports = { dateOnly, streakMetrics };
