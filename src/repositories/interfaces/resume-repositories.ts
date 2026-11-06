import type { EducationRow, ProfileRow, PublicationRow, WorkExperienceRow } from "@/lib/db/schema";

type Writable<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

export type Profile = ProfileRow;
export type ProfileInput = Writable<ProfileRow>;

export type Education = EducationRow;
export type EducationInput = Writable<EducationRow>;

export type WorkExperience = WorkExperienceRow;
export type WorkExperienceInput = Writable<WorkExperienceRow>;

// without the search_vector column
export type Publication = Omit<PublicationRow, "searchVector">;
export type PublicationInput = Writable<Publication>;

export interface ProfileRepository {
  get(): Promise<Profile | null>;
  upsert(input: ProfileInput): Promise<Profile>;
}

// same methods for education, experience and publications
export interface CollectionRepository<T, TInput> {
  list(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: TInput): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}

export type EducationRepository = CollectionRepository<Education, EducationInput>;
export type WorkExperienceRepository = CollectionRepository<WorkExperience, WorkExperienceInput>;
export type PublicationRepository = CollectionRepository<Publication, PublicationInput>;
