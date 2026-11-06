import bcrypt from "bcryptjs";
import type { UserRole } from "@/lib/db/schema";
import type { UserRepository } from "@/repositories/interfaces/user-repository";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export const BCRYPT_COST = 12;

// Password checks. Kept out of the Auth.js setup so it's easy to test on its own.
export class AuthService {
  // used when the email doesn't exist, see below
  private dummyHash: Promise<string> | undefined;

  constructor(private readonly users: UserRepository) {}

  async verifyCredentials(email: string, password: string): Promise<AuthenticatedUser | null> {
    const user = await this.users.findByEmail(email);

    // Always do a bcrypt compare, even for unknown emails. Otherwise the faster
    // response would tell an attacker which emails have accounts.
    const hash = user?.passwordHash ?? (await this.getDummyHash());
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) return null;

    await this.users.touchLastLogin(user.id);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  // Checks the session against the db: the user still exists, is still an admin,
  // and logged in after their last password change. JWTs can't be revoked, so this
  // is how changing the password kicks out other sessions.
  async getActiveAdmin(userId: string, authTime: number | undefined): Promise<AuthenticatedUser | null> {
    const user = await this.users.findById(userId);
    if (!user || user.role !== "admin") return null;
    if (user.passwordChangedAt && (authTime ?? 0) < user.passwordChangedAt.getTime()) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  // Checks the current password and saves a hash of the new one.
  // Unknown user and wrong password look exactly the same from outside.
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.users.findById(userId);
    const hash = user?.passwordHash ?? (await this.getDummyHash());
    const valid = await bcrypt.compare(currentPassword, hash);
    if (!user || !valid) return false;

    await this.users.updatePasswordHash(user.id, await bcrypt.hash(newPassword, BCRYPT_COST));
    return true;
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= bcrypt.hash("timing-equalizer-not-a-real-password", BCRYPT_COST);
    return this.dummyHash;
  }
}
