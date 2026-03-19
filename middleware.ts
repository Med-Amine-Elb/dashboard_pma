import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = "/"
  url.search = ""
  return NextResponse.redirect(url)
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt_token")?.value
  const role = (req.cookies.get("userRole")?.value || "").toLowerCase()
  const pathname = req.nextUrl.pathname

  if (!token) {
    return redirectToLogin(req)
  }

  if (pathname.startsWith("/admin-dashboard") && role !== "admin") {
    return redirectToLogin(req)
  }
  if (pathname.startsWith("/assigner-dashboard") && role !== "assigner") {
    return redirectToLogin(req)
  }
  if (pathname.startsWith("/user-dashboard") && role !== "user") {
    return redirectToLogin(req)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin-dashboard/:path*", "/assigner-dashboard/:path*", "/user-dashboard/:path*"],
}

