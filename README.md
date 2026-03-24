# Quill AI

AI writing assistant SaaS. Sign up, create documents, use AI to improve, continue, summarize, or fix your writing.

Built with Next.js 14 App Router, Prisma (SQLite), NextAuth (GitHub OAuth + email/password), OpenAI gpt-4o-mini.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth.js
- OpenAI API

## Features

- Email/password auth + GitHub OAuth
- Create and manage documents
- AI tools: improve writing, continue text, summarize, fix grammar
- Credit system: free users get 10 AI credits, Pro is unlimited
- Auto-save while typing

## Setup

```bash
git clone https://github.com/shwarzdev/quill-ai
cd quill-ai
npm install
cp .env.example .env.local
# fill in NEXTAUTH_SECRET, OPENAI_API_KEY, optionally GITHUB_CLIENT_ID/SECRET
npx prisma db push
npm run dev
```

Open http://localhost:3000

## Deploy

Works on Vercel out of the box. Add env vars in project settings.
For production, swap SQLite for PostgreSQL — just change the Prisma datasource.
