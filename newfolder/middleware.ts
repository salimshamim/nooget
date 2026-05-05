import authConfig from "./auth.config";
import { DEFAULT_LOGIN_REDIRECT, publicRoutes, authRoutes, apiAuthPrefix, DEFAULT_ADMIN_REDIRECT } from "./routes";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const role = token?.role;

  const { nextUrl } = req;

  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminPage && (!token || role !== 'ADMIN')) {
    const redirectUrl = new URL("/auth/login", nextUrl);
    return Response.redirect(redirectUrl);
  }


  const isLoggedIn = !!token;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute || nextUrl.pathname === '/') {
    if (isLoggedIn) {
      let redirectUrl = new URL(DEFAULT_LOGIN_REDIRECT + '/' + token.username, nextUrl);
      if (role === 'ADMIN') {
        redirectUrl = new URL(DEFAULT_ADMIN_REDIRECT, nextUrl);
      }
      return Response.redirect(redirectUrl);
    } else {
      if (nextUrl.pathname !== '/auth/login') {
        const redirectUrl = new URL("/auth/login", nextUrl);
        return Response.redirect(redirectUrl);
      }
      return;
    }
  }

  if (!isPublicRoute && !isLoggedIn) {
    const redirectUrl = new URL("/auth/login", nextUrl);
    return Response.redirect(redirectUrl);
  }
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
