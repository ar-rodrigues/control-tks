import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedRoutes = [
    "/login",
    "/auth",
    "/api/vin-lists",
    "/api/locations-directory",
    "/manifest.json",
    "/sw.js",
    "/workbox-*.js",
    "/service-worker.js",
  ];

  if (!user && !allowedRoutes.includes(request.nextUrl.pathname)) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url.toString());
  }

  return NextResponse.next();
}
