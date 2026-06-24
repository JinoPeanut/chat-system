import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const userId = request.cookies.get("auth_user_id")?.value;
    const { pathname } = request.nextUrl;

    const isProtectedRoute =
        pathname.startsWith("/home") ||
        pathname.startsWith("/chat") ||
        pathname.startsWith("/notice") ||
        pathname.startsWith("/admin")

    if (isProtectedRoute && !userId) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/home/:path*", "/chat/:path*", "/notice/:path*", "/admin/:path*"],
};
