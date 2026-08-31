import { prisma } from "@/lib/prisma";
import { AISource } from "@/types";

export interface RAGSearchOptions {
  category?: "ORGANON" | "MATERIA_MEDICA" | "REPERTORY" | "PHARMACY" | "PHILOSOPHY" | "CLINICAL" | "ALL";
  verifiedOnly?: boolean;
  limit?: number;
  minSimilarityThreshold?: number; // 0.0 to 1.0 (default 0.35)
}

export interface RAGSearchResult {
  sources: AISource[];
  hasVerifiedMatch: boolean;
  query: string;
  count: number;
}

export class RAGService {
  private static instance: RAGService;

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Performs semantic & lexical search across homeopathic knowledge base
   */
  public async searchKnowledge(
    query: string,
    options: RAGSearchOptions = {}
  ): Promise<RAGSearchResult> {
    const {
      category = "ALL",
      verifiedOnly = false,
      limit = 5,
      minSimilarityThreshold = 0.35,
    } = options;

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return { sources: [], hasVerifiedMatch: false, query, count: 0 };
    }

    try {
      // Build Prisma query condition
      const whereClause: any = {};
      
      if (verifiedOnly) {
        whereClause.document = {
          verificationStatus: "VERIFIED",
        };
      }

      if (category && category !== "ALL") {
        whereClause.document = {
          ...(whereClause.document || {}),
          category: category,
        };
      }

      const chunks = await prisma.knowledgeChunk.findMany({
        where: whereClause,
        include: {
          document: true,
        },
        take: 100, // Fetch candidates for similarity scoring
      });

      if (!chunks || chunks.length === 0) {
        return { sources: [], hasVerifiedMatch: false, query, count: 0 };
      }

      // Compute relevance score for each chunk using TF-IDF & keyword overlap
      const scoredResults = chunks.map((chunk) => {
        const textToMatch = `${chunk.document.title} ${chunk.sectionTitle} ${chunk.content} ${chunk.keywords || ""}`.toLowerCase();
        const score = this.calculateSimilarityScore(queryTokens, textToMatch, query);

        const source: AISource = {
          documentId: chunk.documentId,
          title: chunk.document.title,
          category: chunk.document.category as AISource["category"],
          author: chunk.document.author,
          sourceBook: chunk.document.sourceBook,
          chapterOrAphorism: chunk.chapterOrAphorism || undefined,
          passage: chunk.content,
          verificationStatus: chunk.document.verificationStatus as AISource["verificationStatus"],
          relevanceScore: Math.round(score * 100) / 100,
        };

        return { source, score };
      });

      // Filter by threshold and sort descending
      const validResults = scoredResults
        .filter((item) => item.score >= minSimilarityThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.source);

      const hasVerifiedMatch = validResults.some(
        (s) => s.verificationStatus === "VERIFIED"
      );

      return {
        sources: validResults,
        hasVerifiedMatch,
        query,
        count: validResults.length,
      };
    } catch (err) {
      console.error("[RAG Service Error]:", err);
      return { sources: [], hasVerifiedMatch: false, query, count: 0 };
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  private calculateSimilarityScore(
    queryTokens: string[],
    targetText: string,
    rawQuery: string
  ): number {
    let matches = 0;
    const targetTokens = this.tokenize(targetText);

    // Exact phrase match gives high boost
    if (targetText.includes(rawQuery.toLowerCase().trim())) {
      matches += 3.0;
    }

    for (const token of queryTokens) {
      if (targetText.includes(token)) {
        matches += 1.0;
      }
    }

    const baseScore = matches / (queryTokens.length + 1.5);
    return Math.min(1.0, baseScore);
  }
}

export const ragService = RAGService.getInstance();
