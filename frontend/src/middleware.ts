import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("quizlm_token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/overview") || pathname.startsWith("/quizzes");

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
