export function normalizeCuratedWeek(week: string, collectedAt?: string) {
  if (/^\d{4}-\d{2}-W[1-5]$/.test(week)) return week;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(collectedAt ?? "");
  if (!/^\d{4}-W\d{2}$/.test(week) || !match) return week;
  return `${match[1]}-${match[2]}-W${Math.floor((Number(match[3]) - 1) / 7) + 1}`;
}

export function formatCuratedWeek(week: string, collectedAt?: string) {
  const match = /^(\d{4})-(\d{2})-W([1-5])$/.exec(
    normalizeCuratedWeek(week, collectedAt),
  );
  if (!match) return week;
  return `${match[1]} 年 ${Number(match[2])} 月第 ${Number(match[3])} 周`;
}
