import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const crimesTable = pgTable("crimes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cashReward: integer("cash_reward").notNull(),
  respReward: integer("resp_reward").notNull(),
  nerveCost: integer("nerve_cost").notNull(),
  successRate: integer("success_rate").notNull(),
  cooldownSeconds: integer("cooldown_seconds").notNull().default(60),
  jailChanceOnFail: integer("jail_chance_on_fail").notNull().default(20),
  hpLossOnFail: integer("hp_loss_on_fail").notNull().default(10),
  jailSeconds: integer("jail_seconds").notNull().default(300),
  bailCost: integer("bail_cost").notNull().default(5000),
});

export const insertCrimeSchema = createInsertSchema(crimesTable).omit({ id: true });
export type InsertCrime = z.infer<typeof insertCrimeSchema>;
export type Crime = typeof crimesTable.$inferSelect;

export const crimeLogsTable = pgTable("crime_logs", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  crimeId: integer("crime_id").notNull(),
  success: boolean("success").notNull(),
  cashGained: integer("cash_gained").notNull().default(0),
  respectGained: integer("respect_gained").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
