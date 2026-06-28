import { Router, type IRouter } from "express";
import { db, crimesTable, crimeLogsTable, playersTable, playerActivityTable, activityFeedTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetCrimesResponse,
  CommitCrimeParams,
  CommitCrimeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/crimes", async (req, res): Promise<void> => {
  const crimes = await db.select().from(crimesTable);
  res.json(GetCrimesResponse.parse(crimes.map(c => ({
    id: String(c.slug),
    name: c.name,
    description: c.description,
    cashReward: c.cashReward,
    respReward: c.respReward,
    nerveCost: c.nerveCost,
    successRate: c.successRate,
  }))));
});

router.post("/crimes/:crimeId/commit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.crimeId) ? req.params.crimeId[0] : req.params.crimeId;
  const params = CommitCrimeParams.safeParse({ crimeId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [crime] = await db.select().from(crimesTable).where(eq(crimesTable.slug, raw));
  if (!crime) {
    res.status(404).json({ error: "Crime not found" });
    return;
  }

  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  if (player.nerve < crime.nerveCost) {
    res.status(400).json({ error: "Not enough nerve" });
    return;
  }

  const roll = Math.random() * 100;
  const success = roll < crime.successRate;
  const cashGained = success ? crime.cashReward : 0;
  const respectGained = success ? crime.respReward : 0;

  await db.update(playersTable).set({
    nerve: Math.max(0, player.nerve - crime.nerveCost),
    cash: player.cash + cashGained,
    respect: player.respect + respectGained,
  }).where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db.insert(crimeLogsTable).values({
    playerId: DEFAULT_PLAYER_ID,
    crimeId: crime.id,
    success,
    cashGained,
    respectGained,
  });

  if (success) {
    await db.insert(playerActivityTable).values({
      playerId: DEFAULT_PLAYER_ID,
      description: `You have successfully robbed a`,
      target: crime.name,
      amount: cashGained,
      type: "crime",
    });
  }

  const message = success
    ? `You successfully committed ${crime.name} and earned $${cashGained.toLocaleString()}.`
    : `You failed to commit ${crime.name}. Better luck next time.`;

  res.json(CommitCrimeResponse.parse({ success, message, cashGained, respectGained }));
});

export default router;
