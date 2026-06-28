import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { GetPlayerResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_PLAYER_ID = 1;

router.get("/player/me", async (req, res): Promise<void> => {
  const [player] = await db.select().from(playersTable).where(
    (await import("drizzle-orm")).eq(playersTable.id, DEFAULT_PLAYER_ID)
  );

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json(GetPlayerResponse.parse(player));
});

export default router;
