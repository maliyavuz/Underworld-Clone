import { Router, type IRouter } from "express";
import { db, messagesTable, playersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  GetInboxResponse,
  SendMessageResponse,
  MarkMessageReadResponse,
  SendMessageBody,
} from "@workspace/api-zod";

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

router.get("/messages/inbox", async (req, res): Promise<void> => {
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.receiverPlayerId, DEFAULT_PLAYER_ID))
    .orderBy(desc(messagesTable.createdAt))
    .limit(50);

  res.json(
    GetInboxResponse.parse(
      messages.map((m) => ({
        id: m.id,
        senderUsername: m.senderUsername,
        content: m.content,
        read: m.read,
        timeAgo: timeAgo(m.createdAt),
      }))
    )
  );
});

router.post("/messages/send", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [sender] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, DEFAULT_PLAYER_ID));

  await db.insert(messagesTable).values({
    senderUsername: sender?.username ?? "Unknown",
    receiverPlayerId: DEFAULT_PLAYER_ID,
    content: parsed.data.content,
  });

  res.json(SendMessageResponse.parse({ success: true }));
});

router.post("/messages/:messageId/read", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.messageId)
    ? req.params.messageId[0]
    : req.params.messageId;
  const messageId = parseInt(rawId, 10);

  await db
    .update(messagesTable)
    .set({ read: true })
    .where(eq(messagesTable.id, messageId));

  res.json(MarkMessageReadResponse.parse({ success: true }));
});

export default router;
