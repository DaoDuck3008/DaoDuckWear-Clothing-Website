import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV !== "production";

  // 'strict-dynamic' cho phép script được load bởi script trusted (ví dụ Next.js runtime)
  // cũng được tin tưởng — không cần liệt kê từng file /_next/static/
  // 'unsafe-eval' chỉ cần trong dev: React dùng eval() để reconstruct call stacks khi debug
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com",
    `connect-src 'self' ${apiUrl} https://accounts.google.com https://provinces.open-api.vn`,
    "font-src 'self'",
    "frame-src https://accounts.google.com https://www.google.com",
    "object-src 'none'",
  ].join("; ");

  // Gắn nonce vào request header để layout.tsx đọc được
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    {
      // Chỉ chạy proxy cho page requests — bỏ qua static assets và image optimization
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-action" },
        { type: "header", key: "content-type", value: "multipart/form-data" },
      ],
    },
  ],
};
