import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const heistPlansTable = pgTable("heist_plans", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  nerveCost: integer("nerve_cost").notNull(),
  minPlayers: integer("min_players").notNull().default(1),
});

export const insertHeistPlanSchema = createInsertSchema(heistPlansTable).omit({ id: true });
export type InsertHeistPlan = z.infer<typeof insertHeistPlanSchema>;
export type HeistPlan = typeof heistPlansTable.$inferSelect;
