import { Router, type IRouter } from "express";
import { db, vehicleTargetsTable, garageVehiclesTable, playersTable, playerActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetAvailableCarsResponse, StealCarResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/car-theft/available", async (req, res): Promise<void> => {
  const cars = await db.select().from(vehicleTargetsTable);
  res.json(GetAvailableCarsResponse.parse(cars.map(c => ({
    id: String(c.slug),
    make: c.make,
    model: c.model,
    value: c.value,
    difficultyPct: c.difficultyPct,
  }))));
});

router.post("/car-theft/steal", async (req, res): Promise<void> => {
  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const targets = await db.select().from(vehicleTargetsTable);
  if (targets.length === 0) {
    res.status(404).json({ error: "No vehicles available" });
    return;
  }

  const target = targets[Math.floor(Math.random() * targets.length)];
  const roll = Math.random() * 100;
  const success = roll > target.difficultyPct;

  if (success) {
    await db.insert(garageVehiclesTable).values({
      playerId: DEFAULT_PLAYER_ID,
      make: target.make,
      model: target.model,
      year: 2020 + Math.floor(Math.random() * 5),
      value: target.value,
      condition: "Good",
    });

    await db.update(playersTable).set({
      cash: player.cash + Math.floor(target.value * 0.3),
    }).where(eq(playersTable.id, DEFAULT_PLAYER_ID));

    await db.insert(playerActivityTable).values({
      playerId: DEFAULT_PLAYER_ID,
      description: `You stole a`,
      target: `${target.make} ${target.model}`,
      amount: target.value,
      type: "car_theft",
    });

    res.json(StealCarResponse.parse({
      success: true,
      message: `You successfully stole a ${target.make} ${target.model}!`,
      vehicle: `${target.make} ${target.model}`,
      cashValue: target.value,
    }));
  } else {
    res.json(StealCarResponse.parse({
      success: false,
      message: `You failed to steal the ${target.make} ${target.model}. The alarm went off!`,
      vehicle: null,
      cashValue: 0,
    }));
  }
});

export default router;
