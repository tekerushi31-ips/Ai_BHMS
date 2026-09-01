import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed formats: JPG, PNG, WEBP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds maximum limit of 5MB" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const filename = `avatar-${user.id}-${Date.now()}.${fileExt}`;

    let avatarUrl = "";

    // Attempt Supabase Storage Upload if configured
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`doctor-profiles/${filename}`, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(`doctor-profiles/${filename}`);
        avatarUrl = publicData.publicUrl;
      }
    } catch (e) {
      console.warn("Supabase storage upload fallback to local storage:", e);
    }

    // Fallback to local storage if Supabase upload isn't connected
    if (!avatarUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, filename);
      await fs.writeFile(localFilePath, fileBuffer);
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    // Persist avatar URL on User record
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (err: any) {
    console.error("[Avatar Upload Error]:", err);
    return NextResponse.json(
      { error: "Failed to upload profile photo. Please try again." },
      { status: 500 }
    );
  }
}
