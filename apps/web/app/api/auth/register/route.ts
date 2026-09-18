import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ai-saas/database";
import { hash } from "bcryptjs";
import { z } from "zod";
import { issueVerificationToken } from "@/lib/verification";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "USER",
    },
  });

  // Send the email-verification flow immediately after account creation.
  // The account remains unusable through credentials until the address is confirmed.
  await issueVerificationToken(user.id, user.email);

  // Assign free plan
  const freePlan = await prisma.plan.findFirst({ where: { tier: "FREE" } });
  if (freePlan) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: "ACTIVE",
        billingInterval: "MONTHLY",
      },
    });
  }

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}
