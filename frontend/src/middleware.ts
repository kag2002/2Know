import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("2know_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that NEVER require authentication
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicRoute = pathname.startsWith("/test") || pathname === "/";

  // Redirect authenticated users away from login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // SECURITY: All non-public, non-auth routes require authentication
  // This covers: /overview, /quizzes, /students, /classes, /grading, /settings,
  // /notes, /tags, /reports, /sharing, /omr, /rubrics, /question-bank, /tools, etc.
  if (!isAuthRoute && !isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)" ],
};
