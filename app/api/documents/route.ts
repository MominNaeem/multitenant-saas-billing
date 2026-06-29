import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getPlanLimits } from "@/lib/tenant";
import { Plan } from "@prisma/client";
import { z } from "zod";

function getTenantId(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never): string | null {
  return (session?.user as { tenantId?: string })?.tenantId ?? null;
}

function getPlan(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never): Plan {
  const plan = (session?.user as { plan?: string })?.plan;
  if (plan === "pro" || plan === "enterprise" || plan === "free") return plan;
  return "free";
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tenantId = getTenantId(session);
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant found." }, { status: 400 });
  }

  const plan = getPlan(session);
  const limits = getPlanLimits(plan);

  const documents = await prisma.document.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    documents,
    total: documents.length,
    limit: limits.maxDocuments,
    plan,
  });
}

const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tenantId = getTenantId(session);
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant found." }, { status: 400 });
  }

  const plan = getPlan(session);
  const limits = getPlanLimits(plan);

  const currentCount = await prisma.document.count({ where: { tenantId } });

  if (currentCount >= limits.maxDocuments) {
    return NextResponse.json(
      { error: `Document limit reached for your ${plan} plan. Please upgrade to add more.` },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = CreateDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      tenantId,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
