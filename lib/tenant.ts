import { Plan } from "@prisma/client";
import { NextRequest } from "next/server";

export function getTenantFromRequest(req: NextRequest): string | null {
  const tenantHeader = req.headers.get("x-tenant-id");
  if (tenantHeader) return tenantHeader;

  const host = req.headers.get("host") ?? "";
  const parts = host.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export function requireTenant(session: { user?: { tenantId?: string | null } } | null): string {
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    throw new Error("No tenant found in session");
  }
  return tenantId;
}

interface PlanLimits {
  maxDocuments: number;
  maxMembers: number;
  features: string[];
}

export function getPlanLimits(plan: Plan): PlanLimits {
  switch (plan) {
    case "enterprise":
      return {
        maxDocuments: Infinity,
        maxMembers: Infinity,
        features: ["unlimited-documents", "unlimited-members", "priority-support", "sso", "audit-logs", "custom-domain"],
      };
    case "pro":
      return {
        maxDocuments: 500,
        maxMembers: 25,
        features: ["500-documents", "25-members", "priority-support", "api-access"],
      };
    case "free":
    default:
      return {
        maxDocuments: 10,
        maxMembers: 3,
        features: ["10-documents", "3-members"],
      };
  }
}
