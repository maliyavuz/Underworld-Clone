import { Router, type IRouter } from "express";
import { db, crimesTable, crimeLogsTable, playersTable, playerActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetCrimesResponse,
  CommitCrimeParams,
  CommitCrimeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

router.get("/crimes", async (req, res): Promise<void> => {
  const crimes = await db.select().from(crimesTable);
  res.json(GetCrimesResponse.parse(crimes.map(c => ({
    id: String(c.slug),
    name: c.name,
    description: c.description,
    cashReward: c.cashReward,
    respReward: c.respReward,
    nerveCost: c.nerveCost,
    successRate: c.successRate,
    cooldownSeconds: c.cooldownSeconds,
    jailChanceOnFail: c.jailChanceOnFail,
    hpLossOnFail: c.hpLossOnFail,
    jailSeconds: c.jailSeconds,
    bailCost: c.bailCost,
  }))));
});

router.post("/crimes/:crimeId/commit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.crimeId) ? req.params.crimeId[0] : req.params.crimeId;
  const params = CommitCrimeParams.safeParse({ crimeId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [crime] = await db.select().from(crimesTable).where(eq(crimesTable.slug, raw));
  if (!crime) {
    res.status(404).json({ error: "Crime not found" });
    return;
  }

  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, DEFAULT_PLAYER_ID));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const now = Date.now();

  // Jail check
  if (player.jailUntil && player.jailUntil.getTime() > now) {
    const secsLeft = Math.ceil((player.jailUntil.getTime() - now) / 1000);
    res.status(400).json({ error: `You are in jail for ${secsLeft} more seconds.` });
    return;
  }

  // Cooldown check
  if (player.crimeCooldownUntil && player.crimeCooldownUntil.getTime() > now) {
    const secsLeft = Math.ceil((player.crimeCooldownUntil.getTime() - now) / 1000);
    res.status(400).json({ error: `Crime cooldown active. Wait ${secsLeft} seconds.` });
    return;
  }

  if (player.nerve < crime.nerveCost) {
    res.status(400).json({ error: "Not enough nerve" });
    return;
  }

  const roll = Math.random() * 100;
  const success = roll < crime.successRate;
  const cashGained = success ? crime.cashReward : 0;
  const respectGained = success ? crime.respReward : 0;

  let hpLost = 0;
  let jailed = false;
  let newHp = player.hp;
  let newJailUntil: Date | null = player.jailUntil;
  let newJailBail = player.jailBail;

  if (!success) {
    // HP loss on failure
    hpLost = crime.hpLossOnFail;
    newHp = Math.max(1, player.hp - hpLost);

    // Jail chance on failure
    const jailRoll = Math.random() * 100;
    if (jailRoll < crime.jailChanceOnFail) {
      jailed = true;
      newJailUntil = new Date(now + crime.jailSeconds * 1000);
      newJailBail = crime.bailCost;
    }
  }

  // Set cooldown (only on success path too)
  const newCooldown = new Date(now + crime.cooldownSeconds * 1000);

  await db.update(playersTable).set({
    nerve: Math.max(0, player.nerve - crime.nerveCost),
    cash: player.cash + cashGained,
    respect: player.respect + respectGained,
    hp: newHp,
    jailUntil: newJailUntil,
    jailBail: newJailBail,
    crimeCooldownUntil: newCooldown,
  }).where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db.insert(crimeLogsTable).values({
    playerId: DEFAULT_PLAYER_ID,
    crimeId: crime.id,
    success,
    cashGained,
    respectGained,
  });

  if (success) {
    await db.insert(playerActivityTable).values({
      playerId: DEFAULT_PLAYER_ID,
      description: `You have successfully committed`,
      target: crime.name,
      amount: cashGained,
      type: "crime",
    });
  }

  let message: string;
  if (success) {
    message = `You successfully committed ${crime.name} and earned $${cashGained.toLocaleString()}.`;
  } else if (jailed) {
    message = `You were caught committing ${crime.name}! You've been thrown in jail.`;
  } else {
    message = `You failed to commit ${crime.name}. You lost ${hpLost} HP.`;
  }

  res.json(CommitCrimeResponse.parse({
    success,
    message,
    cashGained,
    respectGained,
    jailed,
    cooldownSeconds: crime.cooldownSeconds,
    hpLost,
  }));
});

export default router;
