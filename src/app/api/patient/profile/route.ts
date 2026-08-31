import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await prisma.patientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.patientProfile.create({
        data: {
          userId: user.id,
          age: 30,
          gender: "Male",
          phone: "",
          address: "",
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      age,
      gender,
      dob,
      phone,
      address,
      emergencyContact,
      bloodGroup,
      allergies,
    } = body;

    // Update user name if provided
    if (name?.trim()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    const updatedProfile = await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {
        age: age ? parseInt(String(age), 10) : undefined,
        gender,
        dob: dob ? new Date(dob) : undefined,
        phone,
        address,
        emergencyContact,
        bloodGroup,
        allergies,
      },
      create: {
        userId: user.id,
        age: age ? parseInt(String(age), 10) : 30,
        gender: gender || "Male",
        dob: dob ? new Date(dob) : undefined,
        phone,
        address,
        emergencyContact,
        bloodGroup,
        allergies,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: "Profile information updated successfully!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update patient profile" },
      { status: 500 }
    );
  }
}
