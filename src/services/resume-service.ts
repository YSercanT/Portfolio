import { cacheKeys, getOrSet, type CacheStore } from "@/lib/cache/cache-store";
import type {
  Education,
  EducationRepository,
  Profile,
  ProfileRepository,
  Publication,
  PublicationRepository,
  WorkExperience,
  WorkExperienceRepository,
} from "@/repositories/interfaces/resume-repositories";

export interface Resume {
  profile: Profile | null;
  experience: WorkExperience[];
  education: Education[];
  publications: Publication[];
}

const RESUME_TTL_SEC = 60 * 30;

// Loads the resume (profile, experience, education, publications). It's small and
// rarely changes, so all of it is cached under one key. The admin actions write
// to the repositories directly and then call invalidate().
export class ResumeService {
  constructor(
    private readonly repos: {
      profile: ProfileRepository;
      experience: WorkExperienceRepository;
      education: EducationRepository;
      publications: PublicationRepository;
    },
    private readonly cache: CacheStore,
  ) {}

  getResume(): Promise<Resume> {
    return getOrSet(this.cache, cacheKeys.resume, RESUME_TTL_SEC, async () => {
      const [profile, experience, education, publications] = await Promise.all([
        this.repos.profile.get(),
        this.repos.experience.list(),
        this.repos.education.list(),
        this.repos.publications.list(),
      ]);
      return { profile, experience, education, publications };
    });
  }

  async invalidate(): Promise<void> {
    try {
      await this.cache.del(cacheKeys.resume);
    } catch (err) {
      console.error("[resume-service] cache invalidation failed", err); // it'll expire on its own
    }
  }
}
