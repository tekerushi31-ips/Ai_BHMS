import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  const documents = await prisma.knowledgeDocument.findMany({
    include: {
      chunks: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      category,
      author,
      sourceBook,
      edition,
      chapterOrAphorism,
      sectionTitle,
      content,
      keywords,
      verificationStatus = "VERIFIED",
    } = await req.json();

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Title, category, and content are required" },
        { status: 400 }
      );
    }

    const doc = await prisma.knowledgeDocument.create({
      data: {
        title,
        category,
        author: author || "Homoeopathic Faculty",
        sourceBook: sourceBook || title,
        edition: edition || "Standard Edition",
        verificationStatus,
        createdBy: user.name,
        chunks: {
          create: {
            chapterOrAphorism: chapterOrAphorism || null,
            sectionTitle: sectionTitle || title,
            content,
            keywords: keywords || null,
            verifiedOnly: verificationStatus === "VERIFIED",
          },
        },
      },
      include: { chunks: true },
    });

    await auditService.logAction({
      userId: user.id,
      action: "KNOWLEDGE_DOCUMENT_CREATED",
      resource: "KNOWLEDGE",
      resourceId: doc.id,
      details: { title, category, verificationStatus },
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (err) {
    console.error("[Create Knowledge Error]:", err);
    return NextResponse.json({ error: "Failed to create knowledge entry" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, verificationStatus } = await req.json();

    if (!id || !verificationStatus) {
      return NextResponse.json(
        { error: "Document ID and verificationStatus are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.knowledgeDocument.update({
      where: { id },
      data: { verificationStatus },
    });

    // Also update all chunks verifiedOnly flag
    await prisma.knowledgeChunk.updateMany({
      where: { documentId: id },
      data: { verifiedOnly: verificationStatus === "VERIFIED" },
    });

    await auditService.logAction({
      userId: user.id,
      action: "KNOWLEDGE_STATUS_UPDATED",
      resource: "KNOWLEDGE",
      resourceId: id,
      details: { verificationStatus },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err) {
    console.error("[Update Knowledge Status Error]:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
