import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { auditService } from "@/services/audit";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await auditService.logAction({
      userId: currentUser.id,
      action: "USER_LOGOUT",
      resource: "AUTH",
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true, redirectUrl: "/login" });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
