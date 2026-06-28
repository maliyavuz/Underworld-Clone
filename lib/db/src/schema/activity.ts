import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityFeedTable = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
  avatarColor: text("avatar_color").notNull().default("#d4a017"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const playerActivityTable = pgTable("player_activity", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  description: text("description").notNull(),
  target: text("target"),
  amount: integer("amount").notNull().default(0),
  type: text("type").notNull().default("crime"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivityFeedSchema = createInsertSchema(activityFeedTable).omit({ id: true, createdAt: true });
export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;

export const insertPlayerActivitySchema = createInsertSchema(playerActivityTable).omit({ id: true, createdAt: true });
export type InsertPlayerActivity = z.infer<typeof insertPlayerActivitySchema>;
