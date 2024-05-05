import { auth, signOut } from "@/auth";
import { NextResponse } from "next/server";
import env from "./env";

const adminEmail = env.server.AUTH_ADMIN_EMAIL;

export default auth(async (req) => {
  const loginUrl = req.url.replace(req.nextUrl.pathname, "/login");
  const authenticatedUserEmail = req.auth?.user?.email;

  console.log(
    `Middleware running authentication checks on path "${req.nextUrl.pathname}"`
  );

  if (!authenticatedUserEmail) return Response.redirect(loginUrl);
  if (authenticatedUserEmail && authenticatedUserEmail !== adminEmail) {
    console.log("Authenticated user is not the admin, loging out");
    await signOut();
    return Response.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|icon.ico).*)",
  ],
};
