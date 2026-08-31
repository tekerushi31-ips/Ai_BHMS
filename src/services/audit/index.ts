import { prisma } from "@/lib/prisma";

export class AuditService {
  private static instance: AuditService;

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public async logAction(
    paramOrUserId:
      | {
          userId?: string | null;
          action: string;
          resource: string;
          resourceId?: string | null;
          ipAddress?: string | null;
          details?: Record<string, any>;
        }
      | string
      | null
      | undefined,
    action?: string,
    resource?: string,
    resourceId?: string | null,
    details?: Record<string, any>,
    ipAddress?: string | null
  ): Promise<void> {
    try {
      let finalUserId: string | null = null;
      let finalAction = "";
      let finalResource = "";
      let finalResourceId: string | null = null;
      let finalIp = "127.0.0.1";
      let finalDetails: Record<string, any> | undefined;

      if (typeof paramOrUserId === "object" && paramOrUserId !== null) {
        finalUserId = paramOrUserId.userId || null;
        finalAction = paramOrUserId.action;
        finalResource = paramOrUserId.resource;
        finalResourceId = paramOrUserId.resourceId || null;
        finalIp = paramOrUserId.ipAddress || "127.0.0.1";
        finalDetails = paramOrUserId.details;
      } else {
        finalUserId = paramOrUserId || null;
        finalAction = action || "UNKNOWN_ACTION";
        finalResource = resource || "system";
        finalResourceId = resourceId || null;
        finalIp = ipAddress || "127.0.0.1";
        finalDetails = details;
      }

      await prisma.auditLog.create({
        data: {
          userId: finalUserId,
          action: finalAction,
          resource: finalResource,
          resourceId: finalResourceId,
          ipAddress: finalIp,
          detailsJson: finalDetails ? JSON.stringify(finalDetails) : null,
        },
      });
    } catch (err) {
      console.error("[AuditLog Error]: Failed to write audit record", err);
    }
  }
}

export const auditService = AuditService.getInstance();
