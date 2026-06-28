import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  rank: text("rank").notNull().default("Outsider"),
  rankProgress: integer("rank_progress").notNull().default(0),
  hp: integer("hp").notNull().default(100),
  maxHp: integer("max_hp").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  nerve: integer("nerve").notNull().default(100),
  maxNerve: integer("max_nerve").notNull().default(100),
  cash: integer("cash").notNull().default(10000),
  respect: integer("respect").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  city: text("city").notNull().default("New York"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
