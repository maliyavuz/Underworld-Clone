import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetPlayerResponse } from "@workspace/api-zod";
import { applyRegenAndRank } from "../lib/regen";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/player/me", async (req, res): Promise<void> => {
  const player = await applyRegenAndRank(DEFAULT_PLAYER_ID);

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json(GetPlayerResponse.parse({
    id: player.id,
    username: player.username,
    rank: player.rank,
    rankProgress: player.rankProgress,
    hp: player.hp,
    maxHp: player.maxHp,
    energy: player.energy,
    maxEnergy: player.maxEnergy,
    nerve: player.nerve,
    maxNerve: player.maxNerve,
    cash: player.cash,
    respect: player.respect,
    streakDays: player.streakDays,
    city: player.city,
    jailUntil: player.jailUntil ? player.jailUntil.toISOString() : null,
    crimeCooldownUntil: player.crimeCooldownUntil ? player.crimeCooldownUntil.toISOString() : null,
  }));
});

export default router;
