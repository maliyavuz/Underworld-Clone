import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetJailStatusResponse, PayBailResponse, BustFromJailResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

const BUST_NERVE_COST = 10;
const BUST_SECONDS_REDUCED = 120;

router.get("/jail", async (req, res): Promise<void> => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const now = Date.now();
  const jailUntil = player.jailUntil;
  const inJail = !!jailUntil && jailUntil.getTime() > now;
  const secondsRemaining = inJail
    ? Math.ceil((jailUntil!.getTime() - now) / 1000)
    : 0;

  res.json(
    GetJailStatusResponse.parse({
      inJail,
      secondsRemaining,
      bailAmount: player.jailBail,
      jailUntil: jailUntil ? jailUntil.toISOString() : null,
    })
  );
});

router.post("/jail/bail", async (req, res): Promise<void> => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const now = Date.now();
  const inJail = !!player.jailUntil && player.jailUntil.getTime() > now;

  if (!inJail) {
    res.status(400).json({ error: "You are not in jail" });
    return;
  }

  if (player.cash < player.jailBail) {
    res.status(400).json({
      error: `Not enough cash. Bail is $${player.jailBail.toLocaleString()}.`,
    });
    return;
  }

  await db
    .update(playersTable)
    .set({
      cash: player.cash - player.jailBail,
      jailUntil: null,
      jailBail: 0,
    })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  res.json(
    PayBailResponse.parse({
      success: true,
      message: `You paid $${player.jailBail.toLocaleString()} bail and walked free.`,
    })
  );
});

router.post("/jail/bust", async (req, res): Promise<void> => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const now = Date.now();
  const inJail = !!player.jailUntil && player.jailUntil.getTime() > now;

  if (!inJail) {
    res.status(400).json({ error: "You are not in jail" });
    return;
  }

  if (player.nerve < BUST_NERVE_COST) {
    res.status(400).json({
      error: `Need ${BUST_NERVE_COST} nerve to attempt a bust.`,
    });
    return;
  }

  const secondsRemaining = Math.ceil(
    (player.jailUntil!.getTime() - now) / 1000
  );
  const newSeconds = Math.max(0, secondsRemaining - BUST_SECONDS_REDUCED);
  const newJailUntil =
    newSeconds > 0 ? new Date(now + newSeconds * 1000) : null;

  await db
    .update(playersTable)
    .set({
      nerve: Math.max(0, player.nerve - BUST_NERVE_COST),
      jailUntil: newJailUntil,
      jailBail: newSeconds > 0 ? player.jailBail : 0,
    })
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  res.json(
    BustFromJailResponse.parse({
      success: true,
      message:
        newSeconds === 0
          ? "You busted out of jail!"
          : `You reduced your sentence by ${BUST_SECONDS_REDUCED} seconds.`,
      secondsReduced: Math.min(BUST_SECONDS_REDUCED, secondsRemaining),
      secondsRemaining: newSeconds,
    })
  );
});

export default router;
