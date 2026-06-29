import { Router, type IRouter } from "express";
import { db, marketItemsTable, playerItemsTable, playersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { GetMarketItemsResponse, BuyMarketItemResponse, UseMarketItemResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/market/items", async (req, res): Promise<void> => {
  const items = await db.select().from(marketItemsTable);
  const owned = await db
    .select()
    .from(playerItemsTable)
    .where(eq(playerItemsTable.playerId, DEFAULT_PLAYER_ID));

  const ownedSet = new Set(owned.map((o) => o.itemId));

  res.json(
    GetMarketItemsResponse.parse(
      items.map((item) => ({
        id: item.slug,
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        effect: item.effect,
        owned: ownedSet.has(item.id),
      }))
    )
  );
});

router.post("/market/buy/:itemId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId)
    ? req.params.itemId[0]
    : req.params.itemId;

  const [item] = await db
    .select()
    .from(marketItemsTable)
    .where(eq(marketItemsTable.slug, raw));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
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

  // Consumables (medkit) can be bought multiple times
  if (item.type !== "consumable") {
    const existing = await db
      .select()
      .from(playerItemsTable)
      .where(
        and(
          eq(playerItemsTable.playerId, DEFAULT_PLAYER_ID),
          eq(playerItemsTable.itemId, item.id)
        )
      );
    if (existing.length > 0) {
      res.status(400).json({ error: "You already own this item" });
      return;
    }
  }

  if (player.cash < item.price) {
    res.status(400).json({ error: "Not enough cash to buy this item" });
    return;
  }

  await db
    .update(playersTable)
    .set({ cash: player.cash - item.price })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db.insert(playerItemsTable).values({
    playerId: DEFAULT_PLAYER_ID,
    itemId: item.id,
    quantity: 1,
  });

  res.json(
    BuyMarketItemResponse.parse({
      success: true,
      message: `You purchased ${item.name}.`,
    })
  );
});

router.post("/market/use/:itemId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId)
    ? req.params.itemId[0]
    : req.params.itemId;

  const [item] = await db
    .select()
    .from(marketItemsTable)
    .where(eq(marketItemsTable.slug, raw));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  if (item.type !== "consumable") {
    res.status(400).json({ error: "This item cannot be used" });
    return;
  }

  const [playerItem] = await db
    .select()
    .from(playerItemsTable)
    .where(
      and(
        eq(playerItemsTable.playerId, DEFAULT_PLAYER_ID),
        eq(playerItemsTable.itemId, item.id)
      )
    );

  if (!playerItem) {
    res.status(400).json({ error: "You don't own this item" });
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

  // Remove one from inventory
  if (playerItem.quantity > 1) {
    await db
      .update(playerItemsTable)
      .set({ quantity: playerItem.quantity - 1 })
      .where(eq(playerItemsTable.id, playerItem.id));
  } else {
    await db
      .delete(playerItemsTable)
      .where(eq(playerItemsTable.id, playerItem.id));
  }

  // Apply item effect (medkit: restore 50 HP)
  const hpRestored = Math.min(50, player.maxHp - player.hp);
  const newHp = Math.min(player.maxHp, player.hp + 50);
  await db
    .update(playersTable)
    .set({ hp: newHp })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  res.json(
    UseMarketItemResponse.parse({
      success: true,
      message: hpRestored > 0
        ? `Medkit used! Restored ${hpRestored} HP. (${newHp}/${player.maxHp})`
        : "You're already at full health!",
      hpRestored,
    })
  );
});

export default router;
