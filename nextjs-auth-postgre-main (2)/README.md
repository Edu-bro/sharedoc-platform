# Next.js Auth Demo

A modern authentication system built with Next.js 15, NextAuth.js v5 (Auth.js), Google OAuth, and Neon PostgreSQL.

## Features

- ✅ Next.js 15 with App Router
- ✅ NextAuth.js v5 (Auth.js) 
- ✅ Google OAuth Authentication
- ✅ Neon PostgreSQL Database
- ✅ Prisma ORM
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Vercel Deployment Ready

## Setup Instructions

### 1. Database Setup (Neon)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Update `.env.local` with your `DATABASE_URL`

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`, `https://your-domain.vercel.app`
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env.local`

### 3. Environment Variables

Update `.env.local`:

```env
# NextAuth.js v5 uses AUTH_ prefix
AUTH_SECRET=your_generated_secret_here
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Neon PostgreSQL Database  
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require"

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 5. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment (Vercel via GitHub)

### 1. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `degan85/nextjs-auth-postgre`
4. Vercel will automatically detect Next.js and configure build settings
5. Click "Deploy"

### 2. Add Environment Variables

In Vercel project settings, add these environment variables:
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID` 
- `AUTH_GOOGLE_SECRET`
- `DATABASE_URL`

### 3. Update Google OAuth

Add your Vercel domain to Google OAuth settings:
- Authorized JavaScript origins: `https://your-project-name.vercel.app`
- Authorized redirect URIs: `https://your-project-name.vercel.app/api/auth/callback/google`

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

## Project Structure

```
src/
  app/
    api/auth/[...nextauth]/route.ts  # Auth API routes
    layout.tsx                       # Root layout with SessionProvider  
    page.tsx                        # Home page with auth
  components/
    auth-buttons.tsx                # Sign in/out buttons
  lib/
    prisma.ts                      # Prisma client singleton
  auth.ts                          # NextAuth configuration
prisma/
  schema.prisma                    # Database schema
```

## NextAuth.js v5 Migration Notes

This project uses NextAuth.js v5 (Auth.js) which has breaking changes from v4:

- Package: `next-auth@beta` and `@auth/prisma-adapter`
- Environment variables use `AUTH_*` prefix instead of `NEXTAUTH_*`
- New `auth.ts` configuration file structure  
- Simplified API route handlers
- Universal `auth()` function replaces `getServerSession()`

## License

MIT
