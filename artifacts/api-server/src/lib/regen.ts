import { db, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Player } from "@workspace/db";

/** Nerve regenerates 1 per 5 minutes */
const NERVE_REGEN_PER_MS = 1 / (5 * 60 * 1000);
/** Energy regenerates 1 per 4 minutes */
const ENERGY_REGEN_PER_MS = 1 / (4 * 60 * 1000);
/** HP regenerates 1 per 10 minutes */
const HP_REGEN_PER_MS = 1 / (10 * 60 * 1000);

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

export function getRankForRespect(respect: number): {
  rank: string;
  progress: number;
  nextRank: string | null;
  respectToNext: number;
} {
  let currentIndex = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (respect >= RANKS[i].minRespect) {
      currentIndex = i;
      break;
    }
  }
  const current = RANKS[currentIndex];
  const next = RANKS[currentIndex + 1] ?? null;

  const rangeStart = current.minRespect;
  const rangeEnd = next?.minRespect ?? rangeStart + 1;
  const progress = next
    ? Math.min(100, Math.floor(((respect - rangeStart) / (rangeEnd - rangeStart)) * 100))
    : 100;
  const respectToNext = next ? Math.max(0, next.minRespect - respect) : 0;

  return { rank: current.name, progress, nextRank: next?.name ?? null, respectToNext };
}

export async function applyRegenAndRank(playerId: number): Promise<Player> {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, playerId));

  if (!player) throw new Error("Player not found");

  const now = Date.now();
  const elapsed = now - player.statsLastUpdatedAt.getTime();

  // Calculate regen amounts
  const nerveGain = Math.floor(elapsed * NERVE_REGEN_PER_MS);
  const energyGain = Math.floor(elapsed * ENERGY_REGEN_PER_MS);
  const hpGain = Math.floor(elapsed * HP_REGEN_PER_MS);

  const newNerve = Math.min(player.maxNerve, player.nerve + nerveGain);
  const newEnergy = Math.min(player.maxEnergy, player.energy + energyGain);
  const newHp = Math.min(player.maxHp, player.hp + hpGain);

  // Rank calculation
  const { rank, progress } = getRankForRespect(player.respect);

  // Only update if something changed
  const statsChanged =
    newNerve !== player.nerve ||
    newEnergy !== player.energy ||
    newHp !== player.hp ||
    rank !== player.rank ||
    progress !== player.rankProgress;

  if (statsChanged) {
    await db
      .update(playersTable)
      .set({
        nerve: newNerve,
        energy: newEnergy,
        hp: newHp,
        rank,
        rankProgress: progress,
        statsLastUpdatedAt: new Date(now),
      })
      .where(eq(playersTable.id, playerId));
  }

  return {
    ...player,
    nerve: newNerve,
    energy: newEnergy,
    hp: newHp,
    rank,
    rankProgress: progress,
    statsLastUpdatedAt: new Date(now),
  };
}
