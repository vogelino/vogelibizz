import { auth } from "@/auth";
import { NextResponse } from "next/server";
import env from "./env";

const adminEmails = env.server.AUTH_ADMIN_EMAILS;

export default auth(async (req) => {
  const loginUrl = `${env.server.NEXT_PUBLIC_BASE_URL}/login`;
  const authenticatedUserEmail = req.auth?.user?.email;

  console.log(
    `Middleware running authentication checks on path "${req.nextUrl.pathname}"`
  );

  if (!authenticatedUserEmail) return Response.redirect(loginUrl);
  if (authenticatedUserEmail && !adminEmails.includes(authenticatedUserEmail)) {
    console.log("Authenticated user is not the admin, loging out");
    return Response.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico|icon.ico).*)"],
};
