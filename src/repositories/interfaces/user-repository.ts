import type { UserRole, UserRow } from "@/lib/db/schema";

export type User = UserRow;

export interface CreateUserInput {
  email: string;
  name?: string | null;
  passwordHash: string;
  role: UserRole;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  touchLastLogin(id: string): Promise<void>;
  // saves the new hash and sets password_changed_at, which logs out older sessions
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}
