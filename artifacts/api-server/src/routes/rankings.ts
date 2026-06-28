import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { GetTopRankingsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/rankings/top", async (req, res): Promise<void> => {
  const players = await db.select().from(playersTable).orderBy(desc(playersTable.respect)).limit(20);

  res.json(GetTopRankingsResponse.parse(players.map((p, i) => ({
    position: i + 1,
    username: p.username,
    rank: p.rank,
    respect: p.respect,
    cash: p.cash,
  }))));
});

export default router;
