# CLAUDE.md — RetailOS

## Repository Classification: PUBLIC OSS

This repository is publicly visible. All code here is generic platform infrastructure.

## Forbidden Content (never commit to this repo)

- Business plans, financial projections, pricing strategies
- Personal information (names, emails, addresses, phone numbers)
- API keys, tokens, secrets, or credentials
- Shop-specific branding, copy, or configuration
- Customer, inventory, or sales data
- Any content that identifies a specific business or person

## Correct Pattern

Shop-specific content goes in the **private deployment repository**, which:
- Uses this repo as a git submodule
- Provides `shop.config.ts` (symlinked into `src/shops/local.config.ts`)
- Provides `worker/docs/*.md` for admin-only documents
- Provides `wrangler.toml` with real database bindings and secrets
- Provides `worker/index.ts` wrapper that injects DOCS into the OSS worker's env

## Tech Stack

- Cloudflare Workers (API + static assets)
- D1 (SQLite database)
- Vite + React + TypeScript + Tailwind
- Wouter (routing), Zustand (state), Marked (markdown)
- Email OTP auth via AgentMail
