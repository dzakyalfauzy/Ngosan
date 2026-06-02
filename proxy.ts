import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  const isPublicRoute = pathname === "/login" || pathname === "/register";

  // Belum login → hanya boleh akses /, /login, /register
  if (!token) {
    if (isPublicRoute || pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sudah login di /login atau /register → arahkan ke /dashboard
  if (isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role check dilakukan di masing-masing halaman, bukan di proxy

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
