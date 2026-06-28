import { Router, type IRouter } from "express";
import { db, dailyRewardsTable, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetDailyRewardResponse, ClaimDailyRewardResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;
const REWARD_AMOUNT = 50000;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

router.get("/reward/daily", async (req, res): Promise<void> => {
  const [record] = await db.select().from(dailyRewardsTable).where(
    eq(dailyRewardsTable.playerId, DEFAULT_PLAYER_ID)
  );

  if (!record || !record.lastClaimedAt) {
    res.json(GetDailyRewardResponse.parse({
      canClaim: true,
      nextClaimInSeconds: 0,
      streakDays: record?.streakDays ?? 0,
      rewardAmount: REWARD_AMOUNT,
    }));
    return;
  }

  const elapsed = Date.now() - record.lastClaimedAt.getTime();
  const remaining = Math.max(0, COOLDOWN_MS - elapsed);
  const canClaim = remaining === 0;

  res.json(GetDailyRewardResponse.parse({
    canClaim,
    nextClaimInSeconds: Math.ceil(remaining / 1000),
    streakDays: record.streakDays,
    rewardAmount: REWARD_AMOUNT,
  }));
});

router.post("/reward/daily", async (req, res): Promise<void> => {
  const [record] = await db.select().from(dailyRewardsTable).where(
    eq(dailyRewardsTable.playerId, DEFAULT_PLAYER_ID)
  );

  if (record?.lastClaimedAt) {
    const elapsed = Date.now() - record.lastClaimedAt.getTime();
    if (elapsed < COOLDOWN_MS) {
      res.status(400).json({ error: "Reward not yet available" });
      return;
    }
  }

  const newStreak = (record?.streakDays ?? 0) + 1;

  if (record) {
    await db.update(dailyRewardsTable)
      .set({ lastClaimedAt: new Date(), streakDays: newStreak })
      .where(eq(dailyRewardsTable.playerId, DEFAULT_PLAYER_ID));
  } else {
    await db.insert(dailyRewardsTable).values({
      playerId: DEFAULT_PLAYER_ID,
      lastClaimedAt: new Date(),
      streakDays: newStreak,
    });
  }

  await db.update(playersTable)
    .set({ cash: (await db.select().from(playersTable).where(eq(playersTable.id, DEFAULT_PLAYER_ID)))[0].cash + REWARD_AMOUNT })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  res.json(ClaimDailyRewardResponse.parse({
    success: true,
    amount: REWARD_AMOUNT,
    newStreakDays: newStreak,
  }));
});

export default router;
