import "server-only";
import { RedisCacheStore } from "@/lib/cache/redis-cache-store";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getRedis } from "@/lib/redis";
import { RedisSlidingWindowRateLimiter, type RateLimiter } from "@/lib/security/rate-limiter";
import { DrizzleProjectRepository } from "@/repositories/drizzle/drizzle-project-repository";
import {
  DrizzleEducationRepository,
  DrizzleProfileRepository,
  DrizzlePublicationRepository,
  DrizzleWorkExperienceRepository,
} from "@/repositories/drizzle/drizzle-resume-repositories";
import { DrizzleUserRepository } from "@/repositories/drizzle/drizzle-user-repository";
import type {
  EducationRepository,
  ProfileRepository,
  PublicationRepository,
  WorkExperienceRepository,
} from "@/repositories/interfaces/resume-repositories";
import { AuthService } from "@/services/auth-service";
import { ProjectService } from "@/services/project-service";
import { ResumeService } from "@/services/resume-service";

// Creates the repositories and services and wires them together.
// Everything else gets its dependencies passed in through the constructor.
export interface Container {
  projectService: ProjectService;
  resumeService: ResumeService;
  authService: AuthService;
  profileRepository: ProfileRepository;
  educationRepository: EducationRepository;
  experienceRepository: WorkExperienceRepository;
  publicationRepository: PublicationRepository;
  playgroundRateLimiter: RateLimiter;
  loginRateLimiter: RateLimiter;
}

const globalForContainer = globalThis as unknown as { __hubContainer?: Container };

export function getContainer(): Container {
  return (globalForContainer.__hubContainer ??= buildContainer());
}

function buildContainer(): Container {
  const env = getEnv();
  const db = getDb();
  const redis = getRedis();
  const cache = new RedisCacheStore(redis);

  const profileRepository = new DrizzleProfileRepository(db);
  const educationRepository = new DrizzleEducationRepository(db);
  const experienceRepository = new DrizzleWorkExperienceRepository(db);
  const publicationRepository = new DrizzlePublicationRepository(db);

  return {
    projectService: new ProjectService(new DrizzleProjectRepository(db), cache),
    resumeService: new ResumeService(
      {
        profile: profileRepository,
        education: educationRepository,
        experience: experienceRepository,
        publications: publicationRepository,
      },
      cache,
    ),
    authService: new AuthService(new DrizzleUserRepository(db)),
    profileRepository,
    educationRepository,
    experienceRepository,
    publicationRepository,
    playgroundRateLimiter: new RedisSlidingWindowRateLimiter(redis, {
      prefix: "playground",
      limit: env.PLAYGROUND_RATE_LIMIT,
      windowSeconds: env.PLAYGROUND_RATE_WINDOW_SEC,
    }),
    loginRateLimiter: new RedisSlidingWindowRateLimiter(redis, {
      prefix: "login",
      limit: env.LOGIN_RATE_LIMIT,
      windowSeconds: env.LOGIN_RATE_WINDOW_SEC,
    }),
  };
}
