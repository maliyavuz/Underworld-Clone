export const RANKS = [
  { name: "Outsider",    minRespect: 0 },
  { name: "Street Thug", minRespect: 250 },
  { name: "Associate",   minRespect: 750 },
  { name: "Made Man",    minRespect: 2000 },
  { name: "Soldier",     minRespect: 5000 },
  { name: "Capo",        minRespect: 12000 },
  { name: "Underboss",   minRespect: 30000 },
  { name: "Consigliere", minRespect: 70000 },
  { name: "Boss",        minRespect: 150000 },
  { name: "Godfather",   minRespect: 400000 },
] as const;

export type RankName = typeof RANKS[number]["name"];

export function getRankInfo(respect: number) {
  let idx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (respect >= RANKS[i].minRespect) { idx = i; break; }
  }
  const next = RANKS[idx + 1] ?? null;
  const progress = next
    ? Math.min(100, Math.floor(((respect - RANKS[idx].minRespect) / (next.minRespect - RANKS[idx].minRespect)) * 100))
    : 100;
  return { rank: RANKS[idx], nextRank: next, progress };
}
