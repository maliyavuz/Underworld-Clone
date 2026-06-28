import { Router, type IRouter } from "express";
import { db, garageVehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetGarageVehiclesResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/garage/vehicles", async (req, res): Promise<void> => {
  const vehicles = await db.select().from(garageVehiclesTable).where(
    eq(garageVehiclesTable.playerId, DEFAULT_PLAYER_ID)
  );

  res.json(GetGarageVehiclesResponse.parse(vehicles.map(v => ({
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
    value: v.value,
    condition: v.condition,
  }))));
});

export default router;
