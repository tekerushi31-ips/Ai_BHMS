import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "bhms-ai-super-secret-jwt-key-for-mvp-session-management-2025"
);

const TOKEN_COOKIE_NAME = "bhms_session_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next paths bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/auth/demo-login") ||
    pathname.startsWith("/api/admin/auth/login") ||
    pathname === "/admin/login" ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  let sessionUser: { id: string; role: string; email: string; name: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      sessionUser = {
        id: payload.id as string,
        role: payload.role as string,
        email: payload.email as string,
        name: payload.name as string,
      };
    } catch {
      sessionUser = null;
    }
  }

  // 1. Auth pages (/login, /signup)
  if (pathname === "/login" || pathname === "/signup") {
    // If explicit switch or redirect is requested, let them access the login page
    const isSwitching = request.nextUrl.searchParams.has("switch");
    const hasRedirect = request.nextUrl.searchParams.has("redirect");
    
    if (sessionUser && !isSwitching && !hasRedirect) {
      if (sessionUser.role === "STUDENT") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }
      if (sessionUser.role === "DOCTOR") {
        return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
      }
      if (sessionUser.role === "PATIENT") {
        return NextResponse.redirect(new URL("/patient/dashboard", request.url));
      }
      if (sessionUser.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Protected Student Routes
  if (pathname.startsWith("/student")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (sessionUser.role !== "STUDENT" && sessionUser.role !== "ADMIN") {
      const unauthUrl = new URL("/unauthorized", request.url);
      unauthUrl.searchParams.set("required", "student");
      unauthUrl.searchParams.set("current", sessionUser.role.toLowerCase());
      return NextResponse.redirect(unauthUrl);
    }
  }

  // 3. Protected Doctor Routes
  if (pathname.startsWith("/doctor")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (sessionUser.role !== "DOCTOR" && sessionUser.role !== "ADMIN") {
      const unauthUrl = new URL("/unauthorized", request.url);
      unauthUrl.searchParams.set("required", "doctor");
      unauthUrl.searchParams.set("current", sessionUser.role.toLowerCase());
      return NextResponse.redirect(unauthUrl);
    }
  }

  // 4. Protected Patient Routes
  if (pathname.startsWith("/patient")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (sessionUser.role !== "PATIENT" && sessionUser.role !== "ADMIN") {
      const unauthUrl = new URL("/unauthorized", request.url);
      unauthUrl.searchParams.set("required", "patient");
      unauthUrl.searchParams.set("current", sessionUser.role.toLowerCase());
      return NextResponse.redirect(unauthUrl);
    }
  }

  // 5. Protected Consultation Routes
  if (pathname.startsWith("/consultation")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (
      sessionUser.role !== "DOCTOR" &&
      sessionUser.role !== "PATIENT" &&
      sessionUser.role !== "ADMIN"
    ) {
      const unauthUrl = new URL("/unauthorized", request.url);
      unauthUrl.searchParams.set("required", "consultation");
      unauthUrl.searchParams.set("current", sessionUser.role.toLowerCase());
      return NextResponse.redirect(unauthUrl);
    }
  }

  // 6. Protected Central Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!sessionUser) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (sessionUser.role !== "ADMIN") {
      const unauthUrl = new URL("/unauthorized", request.url);
      unauthUrl.searchParams.set("required", "admin");
      unauthUrl.searchParams.set("current", sessionUser.role.toLowerCase());
      return NextResponse.redirect(unauthUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/consultation/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/select-role",
  ],
};
