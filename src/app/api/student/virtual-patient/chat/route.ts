import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, message } = await req.json();

    const session = await prisma.virtualPatientSession.findUnique({
      where: { id: sessionId },
      include: { case: true },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This case session is already completed." },
        { status: 400 }
      );
    }

    const groundTruth = JSON.parse(session.case.groundTruthJson);
    const discoveredFacts: string[] = JSON.parse(session.factsDiscoveredJson || "[]");
    const transcript: Array<{ sender: string; text: string; timestamp: string }> =
      JSON.parse(session.transcriptJson || "[]");

    const lower = message.toLowerCase();
    let patientReply = "";

    // 1. Check for Sensation Questions
    if (
      lower.includes("sensation") ||
      lower.includes("how does it feel") ||
      lower.includes("type of pain") ||
      lower.includes("nature") ||
      lower.includes("throbbing") ||
      lower.includes("burning") ||
      lower.includes("sharp")
    ) {
      patientReply =
        groundTruth.revealedOnAsking.sensation ||
        "It feels very intense and throbbing inside.";
      if (!discoveredFacts.includes("Sensation / Character")) {
        discoveredFacts.push("Sensation / Character");
      }
    }

    // 2. Check for Time / Modality Questions
    else if (
      lower.includes("time") ||
      lower.includes("when is it worse") ||
      lower.includes("worse") ||
      lower.includes("better") ||
      lower.includes("morning") ||
      lower.includes("evening") ||
      lower.includes("night") ||
      lower.includes("relief") ||
      lower.includes("aggravat")
    ) {
      const timeMod = groundTruth.revealedOnAsking.timeModality;
      const sunMod = groundTruth.revealedOnAsking.sunModality;
      patientReply = [timeMod, sunMod].filter(Boolean).join(" Also, ");
      if (!discoveredFacts.includes("Modalities (Time & Triggers)")) {
        discoveredFacts.push("Modalities (Time & Triggers)");
      }
    }

    // 3. Check for Food / Cravings / Thirst
    else if (
      lower.includes("food") ||
      lower.includes("craving") ||
      lower.includes("desire") ||
      lower.includes("salt") ||
      lower.includes("sweet") ||
      lower.includes("thirst") ||
      lower.includes("drink") ||
      lower.includes("eat") ||
      lower.includes("appetite")
    ) {
      const food = groundTruth.revealedOnAsking.foodCravings || groundTruth.revealedOnAsking.foodPreference;
      const thirst = groundTruth.revealedOnAsking.thirst || groundTruth.revealedOnAsking.appetite;
      patientReply = [food, thirst].filter(Boolean).join(" Regarding drinking/eating: ");
      if (!discoveredFacts.includes("Physical Generals (Cravings/Thirst)")) {
        discoveredFacts.push("Physical Generals (Cravings/Thirst)");
      }
    }

    // 4. Check for Emotions / Mind / Grief / Temperament
    else if (
      lower.includes("mind") ||
      lower.includes("emotion") ||
      lower.includes("stress") ||
      lower.includes("grief") ||
      lower.includes("sad") ||
      lower.includes("temper") ||
      lower.includes("angry") ||
      lower.includes("consol") ||
      lower.includes("anxiety") ||
      lower.includes("fear") ||
      lower.includes("mood")
    ) {
      const emo = groundTruth.revealedOnAsking.emotionalTrigger || groundTruth.revealedOnAsking.temperament;
      patientReply =
        emo ||
        "I generally feel stressed with my schedule, but I try to keep it under control.";
      if (!discoveredFacts.includes("Mental Generals & Emotional Causation")) {
        discoveredFacts.push("Mental Generals & Emotional Causation");
      }
    }

    // 5. Sleep / Thermal
    else if (
      lower.includes("sleep") ||
      lower.includes("dream") ||
      lower.includes("cold") ||
      lower.includes("warm") ||
      lower.includes("weather")
    ) {
      patientReply =
        groundTruth.revealedOnAsking.sleep ||
        "I feel sensitive to weather changes and my sleep has been quite disturbed lately.";
      if (!discoveredFacts.includes("Physical Generals (Sleep & Thermal)")) {
        discoveredFacts.push("Physical Generals (Sleep & Thermal)");
      }
    }

    // 6. Generic conversational reply
    else {
      patientReply =
        "Could you be a bit more specific, Doctor? I want to explain what I am experiencing clearly.";
    }

    // Add entries to transcript
    transcript.push({
      sender: "STUDENT",
      text: message,
      timestamp: new Date().toISOString(),
    });
    transcript.push({
      sender: "PATIENT",
      text: patientReply,
      timestamp: new Date().toISOString(),
    });

    // Update session record
    await prisma.virtualPatientSession.update({
      where: { id: sessionId },
      data: {
        transcriptJson: JSON.stringify(transcript),
        factsDiscoveredJson: JSON.stringify(discoveredFacts),
      },
    });

    return NextResponse.json({
      reply: patientReply,
      transcript,
      factsDiscovered: discoveredFacts,
      keyFactsCount: groundTruth.keyFactsToElicit?.length || 5,
    });
  } catch (err) {
    console.error("[VP Chat Error]:", err);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
