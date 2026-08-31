export type Role = "STUDENT" | "DOCTOR" | "ADMIN" | "PATIENT";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export type AIResponseStatus = "success" | "error" | "demo";

export interface AISource {
  documentId?: string;
  title: string;
  category: "ORGANON" | "MATERIA_MEDICA" | "REPERTORY" | "PHARMACY" | "PHILOSOPHY" | "CLINICAL";
  author: string;
  sourceBook: string;
  chapterOrAphorism?: string;
  passage: string;
  verificationStatus: "VERIFIED" | "REVIEW" | "DRAFT";
  relevanceScore?: number;
}

export interface AIResponse<T> {
  status: AIResponseStatus;
  data?: T;
  sources?: AISource[];
  error?: string;
  latencyMs?: number;
  isDemo?: boolean;
}

export interface CaseAnalysisResult {
  summary: {
    chiefComplaint: string;
    duration: string;
    locationSensation: string;
    modalities: string;
    concomitants: string;
    mentalGenerals: string;
    physicalGenerals: string;
  };
  totalityOfSymptoms: string[];
  missingInformation: string[];
  suggestedRubrics: Array<{
    rubric: string;
    relevance: string;
    kentReference?: string;
  }>;
  safetyAlerts: Array<{
    level: "INFO" | "WARNING" | "CRITICAL";
    message: string;
    clinicalContext: string;
  }>;
  uncertaintyNotes: string;
  disclaimer: string;
}

export interface RepertoryMatch {
  id: string;
  rubric: string;
  chapter: string;
  source: string;
  explanation: string;
  confidenceScore: number;
  relatedRemedies: Array<{
    name: string;
    grade: number; // 1, 2, 3
  }>;
}

export interface VoiceNormalizationResult {
  originalTranscript: string;
  detectedLanguage: "English" | "Hindi" | "Marathi" | "Hinglish";
  normalizedEnglish: {
    chiefComplaint: string;
    duration: string;
    location: string;
    sensation: string;
    modalities: string;
    concomitants: string;
    mentalGenerals: string;
    physicalGenerals: string;
    pastHistory: string;
  };
  clinicalNotes: string;
  confidence: number;
}

export interface FollowUpSummaryResult {
  trend: "IMPROVED" | "UNCHANGED" | "AGGRAVATED" | "MIXED";
  summary: string;
  improvedSymptoms: string[];
  unchangedSymptoms: string[];
  aggravatedSymptoms: string[];
  newSymptoms: string[];
  prescribingConsiderations: string[];
  nextStepsAdvice: string;
}

export interface VirtualPatientFeedback {
  completenessScore: number; // 0 - 100
  questioningScore: number;  // 0 - 100
  factsDiscovered: string[];
  factsMissed: string[];
  questionQualityCritique: string[];
  strengths: string[];
  areasForImprovement: string[];
  overallNarrative: string;
  suggestedRubricsReview: string[];
}

export type VideoSessionStatus =
  | "SCHEDULED"
  | "WAITING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface VideoSessionDTO {
  id: string;
  doctorId: string;
  patientId: string;
  linkedCaseId?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds: number;
  status: VideoSessionStatus;
  joinToken: string;
  expiresAt: string;
  provider: string;
  consentRecorded: boolean;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    patientCode: string;
    age: number;
    gender: string;
    contact?: string | null;
  };
  doctor: {
    id: string;
    name: string;
    email: string;
  };
  notes?: Array<{
    id: string;
    noteText: string;
    pushedToRecord: boolean;
    createdAt: string;
  }>;
}

export interface VideoCallJoinValidationResult {
  valid: boolean;
  message?: string;
  session?: {
    id: string;
    doctorName: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    status: VideoSessionStatus;
    expiresAt: string;
    provider: string;
    scheduledAt?: string | null;
  };
}
