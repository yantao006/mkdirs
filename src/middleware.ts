import { type NextRequest, NextResponse } from "next/server";

/** This deployment is a public directory, not the template's account service. */
export function middleware(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.json(
      {
        error:
          "This directory is read-only. Submissions and accounts are not enabled.",
      },
      { status: 405, headers: { Allow: "GET, HEAD" } },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
