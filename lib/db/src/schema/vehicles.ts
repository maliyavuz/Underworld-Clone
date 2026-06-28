import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vehicleTargetsTable = pgTable("vehicle_targets", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  value: integer("value").notNull(),
  difficultyPct: integer("difficulty_pct").notNull(),
});

export const garageVehiclesTable = pgTable("garage_vehicles", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  value: integer("value").notNull(),
  condition: text("condition").notNull().default("Good"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGarageVehicleSchema = createInsertSchema(garageVehiclesTable).omit({ id: true, createdAt: true });
export type InsertGarageVehicle = z.infer<typeof insertGarageVehicleSchema>;
export type GarageVehicle = typeof garageVehiclesTable.$inferSelect;
