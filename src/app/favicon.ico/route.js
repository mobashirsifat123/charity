import { NextResponse } from "next/server";

export async function GET() {
  const svgIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0b3d2e"/><path d="M32 12 20 30h8l-4 22 20-28h-8l4-12z" fill="#c8a951"/></svg>';

  return new NextResponse(svgIcon, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
