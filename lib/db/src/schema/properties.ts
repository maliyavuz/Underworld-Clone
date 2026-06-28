import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cost: integer("cost").notNull(),
  incomePerHour: integer("income_per_hour").notNull(),
  category: text("category").notNull().default("income"),
});

export const playerPropertiesTable = pgTable("player_properties", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  propertyId: integer("property_id").notNull(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  lastCollectedAt: timestamp("last_collected_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
