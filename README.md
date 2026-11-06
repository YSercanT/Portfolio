# The Hub - Portfolio

This is my personal portfolio, and also a place where I can try out AI models. I wanted something fast and secure that I can maintain on my own, so I built it from scratch and kept it simple. No extra layers I don't actually need.

## Features

* **Admin panel:** I manage my projects, publications, education and work experience from a login-protected panel, so there's no outside CMS.
* **English and Turkish:** The whole site exists in both languages, under `/en` and `/tr`. New visitors land on the right one based on their browser language, and the EN/TR switch in the header remembers their choice. In the admin panel every text field has an English box and a Turkish box. If I leave the Turkish one empty, the site just shows the English text.
* **SEO and link previews:** Every page has its own title, description and canonical link, plus hreflang tags so Google knows `/en/...` and `/tr/...` are the same page in two languages. The sitemap lists every page in both languages, and robots.txt keeps the admin panel, login and API out of search results. When someone shares a link on LinkedIn, X or WhatsApp, the site generates a preview image for it.
* **Project media:** Each project can have an uploaded demo video, a YouTube video or an image. In the project grid, videos start playing (muted) when you hover over the card.
* **Project write-ups:** Project pages can have a longer write-up in Markdown, for things like architecture and the tech behind it.
* **Password change:** I can change the admin password at `/admin/settings`. It asks for the current password first, limits how many times you can try, and logs out every other session once the password is changed.
* **AI playground endpoint:** The API route is there with rate limiting and input validation, but no model is connected to it yet. That's the next step.
* **Security:** Uploaded files are checked by their actual contents (magic bytes), not by the file name. Database queries always use parameters, so SQL injection isn't possible, and Markdown is rendered without raw HTML, so nobody can slip a script onto a page.

## Tech Stack

* **Framework:** Next.js 15 (App Router, Server Components)
* **Language:** TypeScript (strict mode)
* **Styling:** Tailwind CSS v4 with shadcn/ui (dark theme)
* **Database:** PostgreSQL 17 with Drizzle ORM
* **Caching and rate limiting:** Redis 7
* **Auth:** Auth.js v5 (NextAuth) with JWT sessions

## How It's Built

A few decisions I made to keep the code fast and easy to work on:

* **Services and repositories:** The logic (services) doesn't talk to the database directly. It goes through repositories. That keeps things easy to test, and I could switch the database later without touching the rest.
* **One connection each:** In development, Next.js reloads code on every save, which can open a new database connection pool each time until Postgres runs out. So the Postgres and Redis connections are created once and reused.
* **Redis cache:** Pages read from Redis first and only go to Postgres when something isn't cached yet. When I change something in the admin panel, the related cache entries are cleared, so changes show up right away. Both languages live in the same cache entry, so adding Turkish didn't double the cache.
* **Rate limiting:** Login, password change and the playground are rate limited with a sliding window. It runs as a Lua script inside Redis, so two requests at the same time can't both slip past the limit.
* **Indexes:** The tables have B-Tree indexes for sorting and unique lookups, and GIN indexes for full-text search and filtering by tech stack.

## How to Run Locally

You'll need Node.js and Docker.

### 1. Set up the environment

Copy the example env file:

```bash
cp .env.example .env
```

Generate a secret and paste it into `AUTH_SECRET` in `.env`:

```bash
openssl rand -base64 32
```

Then set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env`. The password has to be at least 12 characters. If you skip this, no admin account gets created and you won't be able to log in.

### 2. Start Postgres and Redis

They run on ports 5442 and 6390, so they won't clash with anything else you have running locally.

```bash
npm run db:up
```

### 3. Set up the database

Create the tables, then add the admin account and some starter content:

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start the app

```bash
npm run dev
```

Open http://localhost:3000. The admin panel is at `/admin`, and you log in with the email and password you put in `.env`.

## Good to Know

* **Forgot the admin password?** Run `npm run db:seed` again. It resets the password to the one in `.env` and logs out all sessions. It won't overwrite any content you've edited.
* **Deploying:** Set `NEXT_PUBLIC_APP_URL` to your real domain *before* running `next build`. Next.js puts the value in at build time, and the links in the sitemap and share previews depend on it.
* **Behind a proxy:** Rate limiting uses the `x-forwarded-for` header to get the visitor's IP. Only trust it if the app sits behind a proxy you control (Vercel, Nginx, Cloudflare); otherwise anyone can fake it.

## Project Structure

* `src/app/` - Pages and routes: the public site under `[lang]`, plus the admin panel, login, API, sitemap and share images.
* `src/components/` - React components, including the shadcn/ui pieces and the media player.
* `src/services/` - Business logic and caching.
* `src/repositories/` - Database queries (Drizzle).
* `src/i18n/` - Language settings, the English and Turkish UI text, and the fallback to English.
* `src/lib/` - Setup for Postgres, Redis, rate limiting, uploads, SEO helpers and the Zod form schemas.
* `src/scripts/` - The seed script.
* `drizzle/` - SQL migration files.

## License

This is my personal portfolio. Feel free to look through the code and use it to learn.
