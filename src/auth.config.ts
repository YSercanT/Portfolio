import type { NextAuthConfig } from "next-auth";

// Auth.js settings that the middleware can use.
//
// The middleware can run on the Edge runtime, so nothing in here may import the db,
// Redis, bcrypt or other Node-only stuff. It only reads the JWT and decides who gets in.
// The actual login (which needs the db) is set up in auth.ts.
const PROTECTED_PREFIXES = ["/admin", "/api/admin"];

export const authConfig = {
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // sessions last 8 hours
    updateAge: 60 * 15, // refresh the token at most every 15 minutes
  },
  providers: [],
  callbacks: {
    // called by the middleware on every admin request
    authorized({ auth, request: { nextUrl } }) {
      const isProtected = PROTECTED_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));
      if (!isProtected) return true;
      // returning false sends them to the login page
      return auth?.user?.role === "admin";
    },
    jwt({ token, user }) {
      // `user` is only set right at login, keep just what we need in the token
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        // login time, checked against password_changed_at later
        token.authTime = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role;
      session.user.authTime = token.authTime;
      return session;
    },
  },
} satisfies NextAuthConfig;
