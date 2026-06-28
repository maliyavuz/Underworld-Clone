import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const marketItemsTable = pgTable("market_items", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(),
  effect: text("effect").notNull(),
});

export const playerItemsTable = pgTable("player_items", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const insertMarketItemSchema = createInsertSchema(marketItemsTable).omit({ id: true });
export type InsertMarketItem = z.infer<typeof insertMarketItemSchema>;
