import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const groupCrimesTable = pgTable("group_crimes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cashReward: integer("cash_reward").notNull(),
  nerveCost: integer("nerve_cost").notNull(),
  minMembers: integer("min_members").notNull().default(2),
  successRate: integer("success_rate").notNull(),
});

export const insertGroupCrimeSchema = createInsertSchema(groupCrimesTable).omit({ id: true });
export type InsertGroupCrime = z.infer<typeof insertGroupCrimeSchema>;
