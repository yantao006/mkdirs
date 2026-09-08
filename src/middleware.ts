import NextAuth from "next-auth";
import { NextResponse } from "next/server";

// Middleware validates the signed session only; server actions/layouts recheck
// the private user record and ownership before reading or changing protected data.
const { auth } = NextAuth({
  providers: [],
  trustHost: true,
  session: { strategy: "jwt" },
});

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const protectedRoute =
    /^\/(dashboard|settings|submit|edit|payment|publish)(\/|$)/.test(pathname);
  if (protectedRoute && !request.auth) {
    const target = new URL("/auth/login", request.url);
    target.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(target);
  }
  if (request.auth && ["/auth/login", "/auth/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/submit/:path*",
    "/edit/:path*",
    "/payment/:path*",
    "/publish/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
