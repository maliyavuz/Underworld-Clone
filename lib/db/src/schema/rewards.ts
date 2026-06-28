import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyRewardsTable = pgTable("daily_rewards", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().unique(),
  lastClaimedAt: timestamp("last_claimed_at"),
  streakDays: integer("streak_days").notNull().default(0),
});

export const insertDailyRewardSchema = createInsertSchema(dailyRewardsTable).omit({ id: true });
export type InsertDailyReward = z.infer<typeof insertDailyRewardSchema>;
export type DailyRewardRecord = typeof dailyRewardsTable.$inferSelect;
