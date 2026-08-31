import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let documents = await prisma.patientDocument.findMany({
      where: { patientUserId: user.id },
      orderBy: { uploadDate: "desc" },
    });

    // If zero documents for new patient demo, seed sample reports
    if (documents.length === 0) {
      await prisma.patientDocument.createMany({
        data: [
          {
            patientUserId: user.id,
            name: "Complete Blood Count (CBC) & Absolute Eosinophil Count",
            documentType: "LAB_REPORT",
            fileUrl: "#",
            fileSize: "1.4 MB",
            aiExplanation: "Shows normal Hemoglobin (14.2 g/dL) and Total Leukocyte Count (7,400/cumm). Absolute Eosinophil Count (AEC) is slightly elevated at 580 cells/mcL, which commonly reflects mild allergic or hyper-reactive sensitivity.",
          },
          {
            patientUserId: user.id,
            name: "Serum Total IgE & Allergen Profile",
            documentType: "LAB_REPORT",
            fileUrl: "#",
            fileSize: "850 KB",
            aiExplanation: "Total Serum IgE is 310 IU/mL (Reference: < 100 IU/mL). Indicates atopic disposition and allergic hyper-responsiveness to environmental inhalants.",
          },
        ],
      });

      documents = await prisma.patientDocument.findMany({
        where: { patientUserId: user.id },
        orderBy: { uploadDate: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, documentType, fileSize } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Report name is required." }, { status: 400 });
    }

    const newDoc = await prisma.patientDocument.create({
      data: {
        patientUserId: user.id,
        name: name.trim(),
        documentType: documentType || "LAB_REPORT",
        fileUrl: "#",
        fileSize: fileSize || "1.1 MB",
      },
    });

    await prisma.patientNotification.create({
      data: {
        patientUserId: user.id,
        title: "Report Uploaded Successfully",
        message: `Your document "${newDoc.name}" has been uploaded and added to your health file.`,
        type: "REPORT",
      },
    });

    return NextResponse.json({
      success: true,
      document: newDoc,
      message: "Report uploaded successfully!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const doc = await prisma.patientDocument.findUnique({
      where: { id: docId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Ownership check
    if (doc.patientUserId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.patientDocument.delete({
      where: { id: docId },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
