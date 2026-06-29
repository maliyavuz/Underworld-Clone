import { Router, type IRouter } from "express";
import { db, vehicleTargetsTable, garageVehiclesTable, playersTable, playerActivityTable, playerItemsTable, marketItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetAvailableCarsResponse, StealCarResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;
const ENERGY_COST = 20;

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

  if (player.energy < ENERGY_COST) {
    res.status(400).json({ error: `Not enough energy. Need ${ENERGY_COST}, have ${player.energy}.` });
    return;
  }

  // Check if player owns lockpick set (bonus to success)
  const ownedItems = await db
    .select({ slug: marketItemsTable.slug })
    .from(playerItemsTable)
    .innerJoin(marketItemsTable, eq(playerItemsTable.itemId, marketItemsTable.id))
    .where(eq(playerItemsTable.playerId, DEFAULT_PLAYER_ID));
  const itemSlugs = new Set(ownedItems.map(i => i.slug));
  const hasLockpick = itemSlugs.has("lockpick-set");

  const targets = await db.select().from(vehicleTargetsTable);
  if (targets.length === 0) {
    res.status(404).json({ error: "No vehicles available" });
    return;
  }

  const target = targets[Math.floor(Math.random() * targets.length)];
  const roll = Math.random() * 100;
  const bonusChance = hasLockpick ? 15 : 0;
  const success = roll < (100 - target.difficultyPct + bonusChance);

  const cashBonus = success ? Math.floor(target.value * 0.3) : 0;

  await db.update(playersTable).set({
    energy: Math.max(0, player.energy - ENERGY_COST),
    cash: player.cash + cashBonus,
  }).where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  if (success) {
    await db.insert(garageVehiclesTable).values({
      playerId: DEFAULT_PLAYER_ID,
      make: target.make,
      model: target.model,
      year: 2020 + Math.floor(Math.random() * 5),
      value: target.value,
      condition: "Good",
    });

    await db.insert(playerActivityTable).values({
      playerId: DEFAULT_PLAYER_ID,
      description: `You stole a`,
      target: `${target.make} ${target.model}`,
      amount: target.value,
      type: "car_theft",
    });
  }

  res.json(StealCarResponse.parse({
    success,
    message: success
      ? `You successfully stole a ${target.make} ${target.model}! (+${ENERGY_COST} energy used)`
      : `The alarm went off! You failed to steal the ${target.make} ${target.model}. (${ENERGY_COST} energy used)`,
    vehicle: success ? `${target.make} ${target.model}` : null,
    cashValue: target.value,
  }));
});

export default router;
