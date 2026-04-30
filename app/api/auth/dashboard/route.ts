import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password") as string | null;

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=1", request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL("/dashboard/writing", request.url)
  );
  response.cookies.set("dashboard_token", process.env.DASHBOARD_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
