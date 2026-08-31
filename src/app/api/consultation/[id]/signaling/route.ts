import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// In-memory signaling store per appointment room
interface SignalPayload {
  senderId: string;
  senderRole: "DOCTOR" | "PATIENT";
  type: "offer" | "answer" | "ice-candidate" | "user-joined" | "user-left";
  data: any;
  timestamp: number;
}

const signalStore = new Map<string, SignalPayload[]>();

// Cleanup stale signals older than 5 minutes
setInterval(() => {
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  for (const [roomId, signals] of signalStore.entries()) {
    const valid = signals.filter((s) => s.timestamp > fiveMinsAgo);
    if (valid.length === 0) {
      signalStore.delete(roomId);
    } else {
      signalStore.set(roomId, valid);
    }
  }
}, 60000);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;
    const { searchParams } = new URL(req.url);
    const since = parseInt(searchParams.get("since") || "0", 10);

    const roomSignals = signalStore.get(appointmentId) || [];
    // Return signals from the peer (not sent by this user) after 'since'
    const newSignals = roomSignals.filter(
      (s) => s.senderId !== user.id && s.timestamp > since
    );

    return NextResponse.json({
      success: true,
      signals: newSignals,
      serverTime: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signaling error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;
    const body = await req.json();
    const { type, data, senderRole } = body;

    if (!type) {
      return NextResponse.json({ error: "Signal type required." }, { status: 400 });
    }

    const payload: SignalPayload = {
      senderId: user.id,
      senderRole: senderRole || (user.role === "DOCTOR" ? "DOCTOR" : "PATIENT"),
      type,
      data,
      timestamp: Date.now(),
    };

    const existing = signalStore.get(appointmentId) || [];
    existing.push(payload);
    signalStore.set(appointmentId, existing);

    return NextResponse.json({
      success: true,
      serverTime: payload.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to post signal" }, { status: 500 });
  }
}
