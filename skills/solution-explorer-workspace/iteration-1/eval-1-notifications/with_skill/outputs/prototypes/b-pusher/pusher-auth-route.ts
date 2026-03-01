// app/api/pusher/auth/route.ts
// Pusher authentication endpoint for private channels.
// Each user subscribes to `private-notifications-{userId}`.
// This endpoint verifies the user is who they claim to be.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pusher } from "@/lib/pusher/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id") as string;
  const channel = formData.get("channel_name") as string;

  // Verify the user is subscribing to their own channel
  const expectedChannel = `private-notifications-${session.user.id}`;
  if (channel !== expectedChannel) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const auth = pusher.authorizeChannel(socketId, channel);
  return NextResponse.json(auth);
}
