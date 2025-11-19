// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Array of regex patterns of paths we want to pretect
  const protectedPaths = [
    /\/shipping-address/,
    /\/payment-method/,
    /\/place-order/,
    /\/profile/,
    /\/user\/(.*)/,
    /\/order\/(.*)/,
    /\/admin/,
  ];
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => p.test(pathname));

  // 2. 로그인 여부 체크 (authjs.session-token 쿠키 있는지)
  const authToken = request.cookies.get("authjs.session-token")?.value;
  const isAuthenticated = !!authToken;

  // 3. 로그인 안 했는데 보호된 경로 접근 → /login 으로 보냄
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/sign-in", request.url);

    // 로그인 후 다시 돌아오게 하고 싶으면 callbackUrl 같이 넘기기
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);

    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  if (!request.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    response.cookies.set("sessionCartId", sessionCartId);
  }

  return response;
}
