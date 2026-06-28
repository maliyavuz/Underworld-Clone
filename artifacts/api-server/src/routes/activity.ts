import { Router, type IRouter } from "express";
import { db, activityFeedTable, playerActivityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetActivityFeedResponse, GetRecentActivityResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DEFAULT_PLAYER_ID = 1;

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

router.get("/activity/feed", async (req, res): Promise<void> => {
  const feed = await db.select().from(activityFeedTable).orderBy(desc(activityFeedTable.createdAt)).limit(20);
  res.json(GetActivityFeedResponse.parse(feed.map(f => ({
    id: f.id,
    username: f.username,
    action: f.action,
    detail: f.detail,
    timeAgo: timeAgo(f.createdAt),
    avatarColor: f.avatarColor,
  }))));
});

router.get("/activity/recent", async (req, res): Promise<void> => {
  const activity = await db.select().from(playerActivityTable)
    .where(eq(playerActivityTable.playerId, DEFAULT_PLAYER_ID))
    .orderBy(desc(playerActivityTable.createdAt))
    .limit(10);

  res.json(GetRecentActivityResponse.parse(activity.map(a => ({
    id: a.id,
    description: a.description,
    target: a.target ?? null,
    amount: a.amount,
    timeAgo: timeAgo(a.createdAt),
    type: a.type,
  }))));
});

export default router;
