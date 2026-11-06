import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/db/schema";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: { id: string; role: UserRole; authTime?: number } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
    // login time in ms
    authTime?: number;
  }
}
