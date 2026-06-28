import { Router, type IRouter } from "express";
import { db, citiesTable, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetCitiesResponse, TravelToCityBody, TravelToCityResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/travel/cities", async (req, res): Promise<void> => {
  const cities = await db.select().from(citiesTable);
  res.json(GetCitiesResponse.parse(cities.map(c => ({
    id: String(c.slug),
    name: c.name,
    country: c.country,
    travelCost: c.travelCost,
    unlockRank: c.unlockRank,
  }))));
});

router.post("/travel/go", async (req, res): Promise<void> => {
  const parsed = TravelToCityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [city] = await db.select().from(citiesTable).where(eq(citiesTable.slug, parsed.data.cityId));
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }

  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  if (player.cash < city.travelCost) {
    res.status(400).json({ error: "Not enough cash to travel" });
    return;
  }

  await db.update(playersTable).set({
    cash: player.cash - city.travelCost,
    city: city.name,
  }).where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  res.json(TravelToCityResponse.parse({
    success: true,
    message: `You have arrived in ${city.name}, ${city.country}.`,
    newCity: city.name,
  }));
});

export default router;
