import { Router, type IRouter } from "express";
import { db, groupCrimesTable, playersTable, playerActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetGroupCrimesResponse, CommitGroupCrimeResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/group-crimes", async (req, res): Promise<void> => {
  const crimes = await db.select().from(groupCrimesTable);
  res.json(
    GetGroupCrimesResponse.parse(
      crimes.map((c) => ({
        id: c.slug,
        name: c.name,
        description: c.description,
        cashReward: c.cashReward,
        nerveCost: c.nerveCost,
        minMembers: c.minMembers,
        successRate: c.successRate,
      }))
    )
  );
});

router.post("/group-crimes/:crimeId/commit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.crimeId)
    ? req.params.crimeId[0]
    : req.params.crimeId;

  const [crime] = await db
    .select()
    .from(groupCrimesTable)
    .where(eq(groupCrimesTable.slug, raw));
  if (!crime) {
    res.status(404).json({ error: "Crime not found" });
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  if (player.nerve < crime.nerveCost) {
    res.status(400).json({ error: "Not enough nerve" });
    return;
  }

  const success = Math.random() * 100 < crime.successRate;
  const cashGained = success ? crime.cashReward : 0;
  const respectGained = success ? Math.floor(crime.cashReward / 500) : 0;

  await db
    .update(playersTable)
    .set({
      nerve: Math.max(0, player.nerve - crime.nerveCost),
      cash: player.cash + cashGained,
      respect: player.respect + respectGained,
    })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  if (success) {
    await db.insert(playerActivityTable).values({
      playerId: DEFAULT_PLAYER_ID,
      description: "You have completed a group crime with your",
      target: "family",
      amount: cashGained,
      type: "group_crime",
    });
  }

  const message = success
    ? `Group crime "${crime.name}" succeeded! Earned $${cashGained.toLocaleString()}.`
    : `Group crime "${crime.name}" failed. Heat is on.`;

  res.json(
    CommitGroupCrimeResponse.parse({ success, message, cashGained, respectGained })
  );
});

export default router;
