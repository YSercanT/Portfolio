import "server-only";
import { eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { CreateUserInput, User, UserRepository } from "@/repositories/interfaces/user-repository";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email))) // uses the unique email index
      .limit(1);
    return row ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const [row] = await this.db
      .insert(users)
      .values({ ...input, email: normalizeEmail(input.email) })
      .returning();
    if (!row) throw new Error("Insert returned no row");
    return row;
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.db.update(users).set({ passwordHash, passwordChangedAt: new Date() }).where(eq(users.id, id));
  }
}
