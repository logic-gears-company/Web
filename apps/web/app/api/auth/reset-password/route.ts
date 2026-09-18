import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const body = await req.json().catch(() => null);

  if (!body?.token || !body?.password) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: body.token, password: body.password }),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({ message: "Unable to process request." }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to reach the authentication service." }, { status: 502 });
  }
}
