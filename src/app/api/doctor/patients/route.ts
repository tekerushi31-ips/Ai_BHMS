import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

const CreatePatientSchema = z.object({
  name: z.string().min(2, "Patient name must be at least 2 characters"),
  age: z.number().min(0).max(120, "Please enter a valid age"),
  gender: z.enum(["Male", "Female", "Other"]),
  contact: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  medicalHistorySummary: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";

  // Query strictly isolated by doctorId
  const patients = await prisma.patient.findMany({
    where: {
      doctorId: user.id,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { patientCode: { contains: search } },
              { contact: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      clinicalCases: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      caseVisits: {
        orderBy: { visitDate: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ patients });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = CreatePatientSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    // Generate consecutive patient code for this doctor
    const count = await prisma.patient.count({ where: { doctorId: user.id } });
    const patientCode = `P-${1000 + count + 1}`;

    const newPatient = await prisma.patient.create({
      data: {
        doctorId: user.id,
        patientCode,
        name: validated.data.name,
        age: validated.data.age,
        gender: validated.data.gender,
        contact: validated.data.contact || null,
        occupation: validated.data.occupation || null,
        address: validated.data.address || null,
        medicalHistorySummary: validated.data.medicalHistorySummary || null,
      },
    });

    await auditService.logAction({
      userId: user.id,
      action: "PATIENT_CREATED",
      resource: "PATIENT",
      resourceId: newPatient.id,
      details: { patientCode, name: newPatient.name },
    });

    return NextResponse.json({ success: true, patient: newPatient }, { status: 201 });
  } catch (err) {
    console.error("[Create Patient Error]:", err);
    return NextResponse.json({ error: "Failed to create patient record" }, { status: 500 });
  }
}
