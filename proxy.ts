import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("dashboard_token")?.value;
  if (!token || token !== process.env.DASHBOARD_SECRET) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
