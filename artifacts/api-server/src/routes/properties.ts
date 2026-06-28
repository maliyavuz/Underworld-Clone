import { Router, type IRouter } from "express";
import { db, propertiesTable, playerPropertiesTable, playersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetPropertiesResponse,
  BuyPropertyResponse,
  CollectPropertyIncomeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/properties", async (req, res): Promise<void> => {
  const all = await db.select().from(propertiesTable);
  const owned = await db
    .select()
    .from(playerPropertiesTable)
    .where(eq(playerPropertiesTable.playerId, DEFAULT_PLAYER_ID));

  const ownedMap = new Map(owned.map((o) => [o.propertyId, o]));

  const result = all.map((p) => {
    const ownership = ownedMap.get(p.id);
    let pendingIncome = 0;
    let lastCollectedAt: string | null = null;
    if (ownership) {
      const hoursElapsed =
        (Date.now() - ownership.lastCollectedAt.getTime()) / (1000 * 60 * 60);
      pendingIncome = Math.floor(hoursElapsed * p.incomePerHour);
      lastCollectedAt = ownership.lastCollectedAt.toISOString();
    }
    return {
      id: p.slug,
      name: p.name,
      description: p.description,
      cost: p.cost,
      incomePerHour: p.incomePerHour,
      category: p.category,
      owned: !!ownership,
      pendingIncome,
      lastCollectedAt,
    };
  });

  res.json(GetPropertiesResponse.parse(result));
});

router.post("/properties/:propertyId/buy", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.propertyId)
    ? req.params.propertyId[0]
    : req.params.propertyId;

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.slug, raw));
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const existing = await db
    .select()
    .from(playerPropertiesTable)
    .where(
      and(
        eq(playerPropertiesTable.playerId, DEFAULT_PLAYER_ID),
        eq(playerPropertiesTable.propertyId, prop.id)
      )
    );

  if (existing.length > 0) {
    res.status(400).json({ error: "Already owned" });
    return;
  }

  if (player.cash < prop.cost) {
    res.status(400).json({ error: "Not enough cash" });
    return;
  }

  await db
    .update(playersTable)
    .set({ cash: player.cash - prop.cost })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db.insert(playerPropertiesTable).values({
    playerId: DEFAULT_PLAYER_ID,
    propertyId: prop.id,
    purchasedAt: new Date(),
    lastCollectedAt: new Date(),
  });

  res.json(
    BuyPropertyResponse.parse({
      success: true,
      message: `You now own ${prop.name}.`,
    })
  );
});

router.post("/properties/:propertyId/collect", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.propertyId)
    ? req.params.propertyId[0]
    : req.params.propertyId;

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.slug, raw));
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const [ownership] = await db
    .select()
    .from(playerPropertiesTable)
    .where(
      and(
        eq(playerPropertiesTable.playerId, DEFAULT_PLAYER_ID),
        eq(playerPropertiesTable.propertyId, prop.id)
      )
    );

  if (!ownership) {
    res.status(400).json({ error: "You do not own this property" });
    return;
  }

  const hoursElapsed =
    (Date.now() - ownership.lastCollectedAt.getTime()) / (1000 * 60 * 60);
  const amount = Math.floor(hoursElapsed * prop.incomePerHour);

  if (amount <= 0) {
    res.json(CollectPropertyIncomeResponse.parse({ success: true, amountCollected: 0 }));
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db
    .update(playersTable)
    .set({ cash: (player?.cash ?? 0) + amount })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db
    .update(playerPropertiesTable)
    .set({ lastCollectedAt: new Date() })
    .where(eq(playerPropertiesTable.id, ownership.id));

  res.json(CollectPropertyIncomeResponse.parse({ success: true, amountCollected: amount }));
});

export default router;
