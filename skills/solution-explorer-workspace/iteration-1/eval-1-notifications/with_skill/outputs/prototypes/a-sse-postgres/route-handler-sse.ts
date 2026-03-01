// app/api/notifications/stream/route.ts
// SSE endpoint that streams notifications to authenticated users
//
// Key architectural decision: We use PostgreSQL LISTEN/NOTIFY to bridge
// database writes to SSE streams. This avoids polling and keeps the
// notification table as the single source of truth.
//
// On Vercel: SSE connections will be dropped at the function timeout limit
// (10s Hobby, 300s Pro). The client's EventSource automatically reconnects,
// and uses Last-Event-ID to fetch missed notifications.

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth"; // or your auth solution
import { Pool } from "pg";

// Dedicated pool for LISTEN connections (separate from query pool)
const listenPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Limit connections used for LISTEN
});

export const runtime = "nodejs"; // SSE requires Node.js runtime, not Edge
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Send initial unread count so the client has immediate state
      const client = await listenPool.connect();
      try {
        const countResult = await client.query(
          "SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND read_at IS NULL",
          [userId]
        );
        send("unread_count", { count: parseInt(countResult.rows[0].count) });

        // Listen for new notifications targeted at this user
        await client.query("LISTEN new_notification");

        client.on("notification", (msg) => {
          if (!msg.payload) return;

          const data = JSON.parse(msg.payload);
          if (data.recipient_id === userId) {
            send("notification", {
              id: data.notification_id,
              type: data.type,
              message: data.message,
              actorId: data.actor_id,
              createdAt: data.created_at,
            });
          }
        });

        // Keep-alive ping every 30 seconds to prevent connection timeout
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keepalive\n\n"));
          } catch {
            clearInterval(keepAlive);
          }
        }, 30_000);

        // Clean up when client disconnects
        request.signal.addEventListener("abort", () => {
          clearInterval(keepAlive);
          client.query("UNLISTEN new_notification").catch(() => {});
          client.release();
        });
      } catch (error) {
        client.release();
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
