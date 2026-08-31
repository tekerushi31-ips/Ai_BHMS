import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STUDENT_SYSTEM_PROMPT } from "@/lib/constants";
import { ragService } from "@/services/rag";
import { aiProvider } from "@/services/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId, topicCategory } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Retrieve relevant educational citations from Homoeopathic knowledge base
    const ragResult = await ragService.searchKnowledge(message, {
      category: topicCategory || "ALL",
      verifiedOnly: false, // Student can access broader educational corpus with citations
      limit: 3,
      minSimilarityThreshold: 0.25,
    });

    // 2. Generate response via AI Provider
    const aiResponse = await aiProvider.generateText(message, {
      systemPrompt: STUDENT_SYSTEM_PROMPT,
      sources: ragResult.sources,
      temperature: 0.3,
    });

    // 3. Persist conversation and messages in database
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const newConv = await prisma.aiConversation.create({
        data: {
          userId: user.id,
          role: "STUDENT",
          title: message.slice(0, 40) + "...",
          contextType: "TUTOR",
        },
      });
      activeConversationId = newConv.id;
    }

    // Save User message
    await prisma.aiMessage.create({
      data: {
        conversationId: activeConversationId,
        sender: "USER",
        content: message,
      },
    });

    // Save AI response message
    const aiMsgRecord = await prisma.aiMessage.create({
      data: {
        conversationId: activeConversationId,
        sender: "AI",
        content: aiResponse.data || "No response generated.",
        sourcesJson: ragResult.sources.length > 0 ? JSON.stringify(ragResult.sources) : null,
        latencyMs: aiResponse.latencyMs || 250,
      },
    });

    return NextResponse.json({
      conversationId: activeConversationId,
      messageId: aiMsgRecord.id,
      content: aiResponse.data,
      sources: ragResult.sources,
      isDemo: aiResponse.isDemo,
      status: aiResponse.status,
    });
  } catch (err) {
    console.error("[AI Tutor Error]:", err);
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
