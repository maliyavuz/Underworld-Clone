import { Router, type IRouter } from "express";
import { db, heistPlansTable, playersTable, playerActivityTable, playerItemsTable, marketItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetHeistPlansResponse, ExecuteHeistBody, ExecuteHeistResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;
const ENERGY_COST = 30;

router.get("/heist/plans", async (req, res): Promise<void> => {
  const plans = await db.select().from(heistPlansTable);
  res.json(GetHeistPlansResponse.parse(plans.map(p => ({
    id: String(p.slug),
    name: p.name,
    description: p.description,
    reward: p.reward,
    nerveCost: p.nerveCost,
    minPlayers: p.minPlayers,
  }))));
});

router.post("/heist/execute", async (req, res): Promise<void> => {
  const parsed = ExecuteHeistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db.select().from(heistPlansTable).where(eq(heistPlansTable.slug, parsed.data.planId));
  if (!plan) {
    res.status(404).json({ error: "Heist plan not found" });
    return;
  }

  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  if (player.nerve < plan.nerveCost) {
    res.status(400).json({ error: `Not enough nerve. Need ${plan.nerveCost}, have ${player.nerve}.` });
    return;
  }

  if (player.energy < ENERGY_COST) {
    res.status(400).json({ error: `Not enough energy for a heist. Need ${ENERGY_COST}, have ${player.energy}.` });
    return;
  }

  // Check owned items for bonuses
  const ownedItems = await db
    .select({ slug: marketItemsTable.slug })
    .from(playerItemsTable)
    .innerJoin(marketItemsTable, eq(playerItemsTable.itemId, marketItemsTable.id))
    .where(eq(playerItemsTable.playerId, DEFAULT_PLAYER_ID));
  const itemSlugs = new Set(ownedItems.map(i => i.slug));
  const hasPoliceScanner = itemSlugs.has("police-scanner");
  const hasLockpick = itemSlugs.has("lockpick-set");

  // Base 65% success, modified by items
  let successChance = 65;
  if (hasPoliceScanner) successChance += 10;
  if (hasLockpick) successChance += 10;

  const success = Math.random() * 100 < successChance;
  const cashGained = success ? plan.reward : 0;
  const respectGained = success ? Math.floor(plan.reward / 800) : 0;

  await db.update(playersTable).set({
    nerve: Math.max(0, player.nerve - plan.nerveCost),
    energy: Math.max(0, player.energy - ENERGY_COST),
    cash: player.cash + cashGained,
    respect: player.respect + respectGained,
  }).where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  if (success) {
    await db.insert(playerActivityTable).values({
      playerId: DEFAULT_PLAYER_ID,
      description: `You have completed a heist:`,
      target: plan.name,
      amount: cashGained,
      type: "heist",
    });
  }

  const message = success
    ? `Heist successful! You earned $${cashGained.toLocaleString()} from ${plan.name}.`
    : `The ${plan.name} heist failed. Lay low for a while.`;

  res.json(ExecuteHeistResponse.parse({ success, message, cashGained, respectGained }));
});

export default router;
