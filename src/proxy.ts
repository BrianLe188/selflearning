import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Redirect-only gate for a snappy UX. Every admin Server Action and page
// re-checks the session itself (see requireAdminSession in src/lib/admin-auth.ts) —
// Proxy coverage alone is not a substitute for that, per the Next.js docs.
export default auth((req) => {
  const isSignInPage = req.nextUrl.pathname === "/admin/sign-in";

  if (!req.auth && !isSignInPage) {
    const signInUrl = new URL("/admin/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (req.auth && isSignInPage) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
