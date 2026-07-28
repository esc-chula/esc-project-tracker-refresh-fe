import { NextResponse, type NextRequest } from "next/server";

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || (process.env.NODE_ENV !== "production" ? "http://localhost:8080" : "");
const authBaseURL = `${apiBaseURL}/api/v1/auth`;

function redirectToLogin() {
  if (!apiBaseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required in production");
  }

  return NextResponse.redirect(`${authBaseURL}/google/login`);
}

function appendBackendCookies(response: NextResponse, backendResponse: Response) {
  const headers = backendResponse.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = headers.getSetCookie?.() ?? [];
  const fallbackSetCookie = backendResponse.headers.get("set-cookie");

  for (const cookie of setCookies.length > 0 ? setCookies : fallbackSetCookie ? [fallbackSetCookie] : []) {
    response.headers.append("Set-Cookie", cookie);
  }
}

async function refreshSession(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (!cookieHeader.includes("refreshToken=")) {
    return null;
  }

  const response = await fetch(`${authBaseURL}/refresh`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Cookie: cookieHeader
    }
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const nextResponse = NextResponse.redirect(request.nextUrl);
  appendBackendCookies(nextResponse, response);
  return nextResponse;
}

export async function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  if (!cookieHeader.includes("accessToken=")) {
    return (await refreshSession(request)) ?? redirectToLogin();
  }

  const response = await fetch(`${authBaseURL}/me`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader
    }
  }).catch(() => null);

  if (response?.ok) {
    return NextResponse.next();
  }

  return (await refreshSession(request)) ?? redirectToLogin();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|.*\\..*).*)"]
};
