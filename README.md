# Restaurant TV Menu CMS
<img width="1536" height="1024" alt="hero-mockup" src="https://github.com/user-attachments/assets/f619dafa-b6f9-4cdc-b409-cc191e396747" />
<img width="1536" height="1024" alt="dish-of-day-mockup" src="https://github.com/user-attachments/assets/69ebaefe-aa3b-4e98-bfa7-c589be099a9b" />

A production-oriented digital signage platform for restaurants to market products on in-store TVs.

This project combines a **content management admin panel** with a **full-screen TV player** so teams can create banner-based promotions, organize them into slides, and run them on loop in real time.

## Why this project

Restaurants need a fast way to keep TV menus and promotions fresh without redesigning static visuals every day. This app solves that by giving staff a simple workflow:

1. Create or reuse a banner template
2. Upload images and fill content
3. Bundle banners into a slide playlist
4. Open the TV playback URL and run it fullscreen

## Core capabilities

- Admin panel for managing templates, banners, and slides
- Dynamic banner templates (hero, price board, list-based, promo split, menu board)
- Media upload to AWS S3
- Slide playlists with order, transition effect, and per-slide speed
- TV-ready full-screen player (`/slide/[id]`) with fade/slide transitions
- Credential-based admin authentication via NextAuth
- PostgreSQL + Prisma data model with seed data for fast onboarding

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth (credentials provider)
- **Storage:** AWS S3 + signed URLs
- **Styling/UI:** CSS + reusable template renderer components

## Application flow

- **Templates** define banner fields (text, number, image, arrays, etc.)
- **Banners** are content instances based on a chosen template
- **Slides** are ordered collections of banners played in sequence on TV
- TV player polls slide updates and keeps content in sync

## Local development setup

### 1. Prerequisites

- Node.js 18+
- npm
- PostgreSQL (local or remote)
- AWS S3 bucket (for image uploads)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` in project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tv_menu"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-secure-random-secret"

AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-north-1"
AWS_BUCKET_NAME="your-bucket-name"
```

Generate a secure NextAuth secret (example):

```bash
openssl rand -base64 32
```

### 4. Run database migrations and seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Default seed admin account

When seeded, the app creates:

- **Email:** `admin@uztv.local`
- **Password:** `Admin123!`

Change this immediately for any shared/public environment.

## Main routes

- `/` - Landing page
- `/admin` - Admin dashboard
- `/admin/login` - Admin sign-in
- `/admin/templates` - Template management
- `/admin/banners` - Banner management
- `/admin/slides` - Slide management
- `/banner/[id]` - Single banner fullscreen preview
- `/slide/[id]` - TV slideshow player

## Project structure

- `src/app/admin/*` - Admin UI pages
- `src/app/api/*` - API routes for templates, banners, slides, auth, uploads
- `src/components/templates/*` - Visual template implementations
- `src/components/BannerForm.tsx` - Dynamic form renderer based on template fields
- `src/components/BannerRenderer.tsx` - Template-to-component resolver
- `prisma/schema.prisma` - Database schema
- `prisma/seed.js` - Seeded templates, banners, and admin user

## Production notes

- Protect secrets using environment management (never commit real credentials)
- Use a managed Postgres instance for reliability
- Configure S3 IAM permissions minimally (least privilege)
- Run `npm run build && npm run start` for production runtime

## Vision

This project is designed as a practical restaurant growth tool: a lightweight CMS + signage engine that makes on-screen marketing editable in minutes instead of hours.
