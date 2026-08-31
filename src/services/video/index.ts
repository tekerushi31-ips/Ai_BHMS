import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";
import { VideoSessionDTO, VideoCallJoinValidationResult } from "@/types";

export interface CreateVideoSessionOptions {
  doctorId: string;
  patientId: string;
  linkedCaseId?: string;
  scheduledAt?: Date | null;
  isInstant?: boolean;
}

export class VideoService {
  private providerName: string;
  private apiKey: string;
  private apiSecret: string;
  private signalingUrl: string;

  constructor() {
    this.providerName = process.env.VIDEO_PROVIDER || "DEMO_WEBRTC";
    this.apiKey = process.env.VIDEO_API_KEY || "";
    this.apiSecret = process.env.VIDEO_API_SECRET || "";
    this.signalingUrl = process.env.VIDEO_SIGNALING_URL || "";
  }

  /**
   * Generates a cryptographically secure random token for expiring patient join link.
   */
  generateJoinToken(): string {
    return crypto.randomBytes(24).toString("hex");
  }

  /**
   * Create an instant or scheduled video session with expiring join token.
   */
  async createVideoSession(options: CreateVideoSessionOptions, baseUrl?: string) {
    const joinToken = this.generateJoinToken();

    // Instant calls expire in 2 hours; scheduled calls expire 24 hours after scheduled time
    const now = new Date();
    let expiresAt: Date;
    let status: "SCHEDULED" | "WAITING" = "WAITING";

    if (options.scheduledAt && options.scheduledAt > now) {
      status = "SCHEDULED";
      expiresAt = new Date(options.scheduledAt.getTime() + 24 * 60 * 60 * 1000);
    } else {
      status = "WAITING";
      expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }

    const session = await prisma.videoSession.create({
      data: {
        doctorId: options.doctorId,
        patientId: options.patientId,
        linkedCaseId: options.linkedCaseId || null,
        scheduledAt: options.scheduledAt || null,
        status,
        joinToken,
        expiresAt,
        provider: this.providerName,
        consentRecorded: false,
      },
      include: {
        patient: true,
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const origin = baseUrl || "http://localhost:3005";
    const patientJoinUrl = `${origin}/video-call/join/${joinToken}`;

    // Audit log
    await auditService.logAction(
      options.doctorId,
      "CREATE_VIDEO_SESSION",
      "video_sessions",
      session.id,
      {
        patientId: options.patientId,
        isScheduled: Boolean(options.scheduledAt),
        provider: this.providerName,
        expiresAt: expiresAt.toISOString(),
      }
    );

    return {
      session,
      patientJoinUrl,
    };
  }

  /**
   * Validate a patient join token without requiring authentication.
   */
  async validateJoinToken(token: string): Promise<VideoCallJoinValidationResult> {
    if (!token || token.trim().length === 0) {
      return { valid: false, message: "Invalid join token provided." };
    }

    const session = await prisma.videoSession.findUnique({
      where: { joinToken: token },
      include: {
        doctor: { select: { name: true } },
        patient: { select: { name: true, age: true, gender: true } },
      },
    });

    if (!session || session.deletedAt) {
      return { valid: false, message: "Video consultation session not found." };
    }

    if (session.status === "COMPLETED") {
      return { valid: false, message: "This video consultation has already been completed." };
    }

    if (session.status === "CANCELLED") {
      return { valid: false, message: "This video consultation has been cancelled." };
    }

    const now = new Date();
    if (session.expiresAt < now) {
      // Mark as expired
      if (session.status !== "EXPIRED") {
        await prisma.videoSession.update({
          where: { id: session.id },
          data: { status: "EXPIRED" },
        });
      }
      return { valid: false, message: "This video consultation join link has expired." };
    }

    return {
      valid: true,
      session: {
        id: session.id,
        doctorName: session.doctor.name,
        patientName: session.patient.name,
        patientAge: session.patient.age,
        patientGender: session.patient.gender,
        status: session.status as any,
        expiresAt: session.expiresAt.toISOString(),
        provider: session.provider,
        scheduledAt: session.scheduledAt?.toISOString() || null,
      },
    };
  }

  /**
   * Save notes taken during a video call.
   */
  async saveSessionNote(sessionId: string, doctorId: string, noteText: string) {
    const session = await prisma.videoSession.findFirst({
      where: { id: sessionId, doctorId, deletedAt: null },
    });

    if (!session) {
      throw new Error("Video session not found or unauthorized.");
    }

    const note = await prisma.videoSessionNote.create({
      data: {
        sessionId,
        noteText,
        pushedToRecord: false,
      },
    });

    return note;
  }

  /**
   * Push video session notes into a permanent Patient CaseVisit record.
   */
  async pushNoteToPatientRecord(sessionId: string, doctorId: string, noteId?: string) {
    const session = await prisma.videoSession.findFirst({
      where: { id: sessionId, doctorId, deletedAt: null },
      include: {
        notes: true,
        patient: true,
      },
    });

    if (!session) {
      throw new Error("Video session not found or unauthorized.");
    }

    let combinedNotes = "";
    if (noteId) {
      const specificNote = session.notes.find((n) => n.id === noteId);
      if (specificNote) combinedNotes = specificNote.noteText;
    } else {
      combinedNotes = session.notes.map((n) => n.noteText).join("\n\n");
    }

    if (!combinedNotes.trim()) {
      throw new Error("No consultation notes recorded to push to patient record.");
    }

    // Get current visit count for the patient
    const existingVisitsCount = await prisma.caseVisit.count({
      where: { patientId: session.patientId },
    });

    const visitNumber = existingVisitsCount + 1;

    // Create new CaseVisit
    const caseVisit = await prisma.caseVisit.create({
      data: {
        patientId: session.patientId,
        caseId: session.linkedCaseId || null,
        doctorId: session.doctorId,
        visitNumber,
        visitDate: session.startedAt || new Date(),
        symptomsSummary: `[Video Consultation Notes - ${new Date().toLocaleDateString()}]: ${combinedNotes}`,
        statusChange: "UNCHANGED",
        observations: `Telehealth consultation conducted via ${session.provider}. Duration: ${Math.round(session.durationSeconds / 60)} min.`,
        prescriptionNotes: "Prescribing decision pending doctor clinical evaluation.",
      },
    });

    // Mark notes as pushed
    await prisma.videoSessionNote.updateMany({
      where: { sessionId },
      data: {
        pushedToRecord: true,
        pushedCaseVisitId: caseVisit.id,
      },
    });

    // Audit log
    await auditService.logAction(
      doctorId,
      "PUSH_VIDEO_NOTE_TO_RECORD",
      "case_visits",
      caseVisit.id,
      {
        sessionId,
        patientId: session.patientId,
      }
    );

    return caseVisit;
  }
}

export const videoService = new VideoService();
