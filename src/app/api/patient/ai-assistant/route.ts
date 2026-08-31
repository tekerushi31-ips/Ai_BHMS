import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "heart attack",
  "difficulty breathing",
  "shortness of breath",
  "cannot breathe",
  "severe bleeding",
  "loss of consciousness",
  "fainted",
  "stroke",
  "slurred speech",
  "seizure",
  "suicide",
  "emergency",
];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const lowerQuery = message.toLowerCase();

    // Check emergency trigger
    const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lowerQuery.includes(kw));

    if (isEmergency) {
      return NextResponse.json({
        success: true,
        response: {
          isEmergency: true,
          content: `🚨 **IMPORTANT EMERGENCY WARNING**:
The symptoms you described may require **immediate professional emergency medical attention**.

Please **call your local emergency medical service (e.g., 108 / 112 / 911) immediately** or proceed directly to the nearest hospital emergency department. 

*The BHMS AI Assistant is an educational tool and cannot provide emergency care or diagnosis.*`,
        },
      });
    }

    // Educational response generator
    let reply = "";

    if (lowerQuery.includes("term") || lowerQuery.includes("eosinophil") || lowerQuery.includes("ige") || lowerQuery.includes("mean")) {
      reply = `**Medical Terminology Guide:**

- **Eosinophils**: A type of white blood cell that helps protect against infections and reacts during allergic responses (e.g. hay fever, asthma, skin allergies).
- **Serum IgE (Immunoglobulin E)**: An antibody produced by the immune system that triggers allergic symptoms when exposed to dust, pollen, or certain foods.
- **Hemoglobin**: The iron-based protein in red blood cells that transports oxygen to muscles and organs.

💡 **Questions for Your Doctor**:
1. *"How do my current levels relate to my daily allergy symptoms?"*
2. *"Are there seasonal precautions or allergen-avoidance measures I should take?"*

*Disclaimer: This is general educational information. Always discuss specific lab results with your doctor.*`;
    } else if (lowerQuery.includes("ask") || lowerQuery.includes("question") || lowerQuery.includes("doctor") || lowerQuery.includes("appointment")) {
      reply = `**Key Questions to Prepare for Your Next Consultation:**

1. **Symptom Changes**:
   - *"What specific improvements or side-effects should I look out for over the next 2 weeks?"*
2. **Dosage & Storage**:
   - *"Are there specific dietary restrictions (like coffee, raw mint, or strong spices) I should observe while taking my homoeopathic remedy?"*
3. **Follow-up Timeline**:
   - *"When is the best time to submit my next symptom follow-up report?"*
4. **Trigger Management**:
   - *"What environmental changes at home or work can help reduce my symptom recurrence?"*

💡 *Tip: Write down the exact times of day when your symptoms feel worse or better.*`;
    } else if (lowerQuery.includes("bring") || lowerQuery.includes("prepare")) {
      reply = `**What to Bring to Your Homoeopathic Appointment:**

1. **Recent Reports & Investigations**: Blood tests (CBC, IgE), allergy panels, or relevant imaging from the past 6 months.
2. **Medication & Supplement List**: Details of any ongoing conventional prescriptions, inhalers, or vitamins.
3. **Symptom Diary**: Notes on when your symptoms started, what triggers them, and what makes them feel better or worse (e.g., warmth, cold air, open air, resting).
4. **Family & Past History**: Any significant medical conditions in your family or past childhood illnesses.`;
    } else {
      reply = `Hello ${user.name}! I am your **Patient Educational Assistant**. 

I can help you:
- 📖 Understand medical & laboratory terminology in simple everyday terms.
- 📋 Formulate relevant questions to discuss with your doctor during visits.
- 🎒 Prepare documents, symptom notes, and questions for your upcoming consultation.

**Important Safety Reminder**:
*I do not diagnose medical conditions, recommend medication changes, or provide dosage instructions. For any diagnosis or prescription, please consult your registered doctor directly.*

How can I help you understand your health information today?`;
    }

    return NextResponse.json({
      success: true,
      response: {
        isEmergency: false,
        content: reply,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process AI assistant request" },
      { status: 500 }
    );
  }
}
