// Seeds the database with some starter content. Run it with: npm run db:seed
//
// Safe to run more than once. It only adds rows that don't exist yet, so it won't
// overwrite anything you changed in the admin panel. The one exception is the admin
// account: running it again resets the password from .env and logs out old sessions,
// which is also how you recover a forgotten password.
//
// This runs outside Next.js, so it makes its own db connection and clears the
// Redis cache at the end so the new data shows up right away.
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import Redis from "ioredis";
import postgres from "postgres";
import { PROFILE_ID, profile, projects, publications, users } from "../lib/db/schema";

const BCRYPT_COST = 12;

const PROFILE = {
  name: "John Doe",
  title: "Computer Engineer | AI & Full-Stack Architect",
  bio:
    "Passionate software engineer specializing in scalable architectures, local LLMs, and high-performance full-stack web " +
    "development. Dedicated to clean code, performance optimization, and innovative AI solutions.",
  avatarUrl: null,
  githubUrl: null, // set in /admin/profile
  linkedinUrl: null,
};

// Turkish versions, only written into fields that are still empty
const PROFILE_TR = {
  titleTr: "Bilgisayar Mühendisi | Yapay Zeka ve Full-Stack Mimar",
  bioTr:
    "Ölçeklenebilir mimariler, yerel LLM'ler ve yüksek performanslı web geliştirme konularında uzmanlaşmış tutkulu yazılım mühendisi. " +
    "Temiz kod, performans optimizasyonu ve yenilikçi yapay zeka çözümlerine odaklı.",
};

const SAMPLE_PROJECT_MD = `Detailed breakdown of the architectural decisions and machine learning pipeline for this project...

## Overview

**Project Alpha** is an example framework showcasing how to integrate heavy machine learning models with a modern Next.js frontend. It demonstrates handling asynchronous tasks without blocking the main UI thread.

## Architecture

| Component | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 15 | Handles UI, SSR, and dynamic routing |
| Backend | Rust (Axum) | High-performance API gateway and task delegation |
| ML Pipeline | PyTorch & Celery | Asynchronous model inference |
| Database | PostgreSQL | Relational data and vector embeddings |

> Draft — expand this section from the admin panel (data flow, validation strategy, results).

## Resources

> Add datasets, papers, and repositories used.
`;

const SAMPLE_PROJECT_MD_TR = `Bu proje için alınan mimari kararların ve makine öğrenmesi işlem hattının detaylı dökümü...

## Genel Bakış

**Proje Alfa**, ağır makine öğrenmesi modellerinin modern bir Next.js önyüzüyle nasıl entegre edileceğini gösteren örnek bir çerçevedir. Ana kullanıcı arayüzünü kilitlemeden asenkron görevlerin nasıl yönetileceğini sergiler.

## Mimari

| Bileşen | Teknoloji | Amaç |
| --- | --- | --- |
| Önyüz | Next.js 15 | UI, SSR ve dinamik yönlendirmeyi yönetir |
| Arka Yüz | Rust (Axum) | Yüksek performanslı API geçidi ve görev dağıtımı |
| ML Hattı | PyTorch & Celery | Asenkron model çıkarımı (inference) |
| Veritabanı| PostgreSQL | İlişkisel veri ve vektör (embedding) depolama |

> Taslak — bu bölümü yönetim panelinden genişletin (veri akışı, doğrulama stratejisi, sonuçlar).

## Kaynaklar

> Kullanılan veri setlerini, makaleleri ve depoları ekleyin.
`;

const SAMPLE_PROJECT_TR = {
  summaryTr:
    "Yüksek performanslı backend servisleri ve makine öğrenmesi modellerini birleştiren tam donanımlı bir AI portfolyo şablonu.",
  contentMdTr: SAMPLE_PROJECT_MD_TR,
};

const SAMPLE_PROJECT = {
  slug: "project-alpha",
  title: "Project Alpha: AI Vision System",
  summary:
    "A full-stack AI portfolio boilerplate combining high-performance backend services with machine learning inference.",
  contentMd: SAMPLE_PROJECT_MD,
  techStack: ["Next.js", "Rust", "PyTorch", "PostgreSQL"],
  githubRepoUrl: null,
  liveSiteUrl: null,
  kaggleUrl: null,
  demoMediaType: "video_hosted" as const,
  demoMediaUrl: null, // upload the demo video from /admin/projects
  featured: true,
  published: true,
  sortOrder: 0,
  publishedAt: new Date(),
};

const SAMPLE_PAPER = {
  title: "Advances in Multi-Modal RAG Architectures for Edge Devices",
  publisher: "AI Conference 2026",
  publishedOn: "2026-01-01",
  abstract: "",
  url: null,
};

async function main() {
  const { DATABASE_URL, REDIS_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
  if (!DATABASE_URL) throw new Error("DATABASE_URL must be set");

  const sql = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(sql);
  try {
    await db.transaction(async (tx) => {
      // admin account (only if the env vars are set)
      if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
        if (SEED_ADMIN_PASSWORD.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
        const email = SEED_ADMIN_EMAIL.trim().toLowerCase();
        const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, BCRYPT_COST);
        await tx
          .insert(users)
          .values({ email, passwordHash, role: "admin", name: "Administrator" })
          // running again resets the password, so also log out existing sessions
          .onConflictDoUpdate({ target: users.email, set: { passwordHash, role: "admin", passwordChangedAt: new Date() } });
        console.log(`+ admin        ${email}`);
      }

      // profile
      const p = await tx
        .insert(profile)
        .values({ id: PROFILE_ID, ...PROFILE })
        .onConflictDoNothing()
        .returning({ id: profile.id });
      console.log(p.length ? "+ profile      created" : "• profile      exists, kept");

      // sample project
      const pr = await tx
        .insert(projects)
        .values(SAMPLE_PROJECT)
        .onConflictDoNothing({ target: projects.slug })
        .returning({ id: projects.id });
      console.log(pr.length ? `+ project      ${SAMPLE_PROJECT.slug}` : `• project      ${SAMPLE_PROJECT.slug} exists, kept`);

      // publication (no unique column to conflict on, so look it up by title)
      const [existing] = await tx
        .select({ id: publications.id })
        .from(publications)
        .where(eq(publications.title, SAMPLE_PAPER.title))
        .limit(1);
      if (!existing) await tx.insert(publications).values(SAMPLE_PAPER);
      console.log(existing ? "• publication  exists, kept" : "+ publication  AI Conference 2026");

      // Turkish text, but don't touch fields someone already filled in
      let filled = 0;
      for (const [key, column] of [
        ["titleTr", profile.titleTr],
        ["bioTr", profile.bioTr],
      ] as const) {
        const r = await tx.update(profile).set({ [key]: PROFILE_TR[key as keyof typeof PROFILE_TR] })
          .where(and(eq(profile.id, PROFILE_ID), eq(column, ""))).returning({ id: profile.id });
        filled += r.length;
      }
      for (const [key, column] of [
        ["summaryTr", projects.summaryTr],
        ["contentMdTr", projects.contentMdTr],
      ] as const) {
        const r = await tx.update(projects).set({ [key]: SAMPLE_PROJECT_TR[key as keyof typeof SAMPLE_PROJECT_TR] })
          .where(and(eq(projects.slug, SAMPLE_PROJECT.slug), eq(column, ""))).returning({ id: projects.id });
        filled += r.length;
      }
      console.log(`+ translations filled ${filled} empty Turkish field(s)`);
    });
  } finally {
    await sql.end();
  }

  // clear the cache, otherwise the new rows wouldn't show until it expires
  if (REDIS_URL) {
    const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
    try {
      await redis.connect();
      // only content cache keys (hub:v1:, hub:v2:...), rate limit keys live under hub:rl: and stay.
      // KEYS is fine in a one-off script like this, just never in a request handler.
      const keys = await redis.keys("hub:v[0-9]*:*");
      if (keys.length) await redis.unlink(...keys);
      console.log(`+ cache        cleared ${keys.length} key(s)`);
    } catch (err) {
      console.warn("! cache        could not clear (entries expire via TTL):", (err as Error).message);
    } finally {
      redis.disconnect();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});