# AI Agent Instructions — RetailOS

## Critical Rule

**This is a PUBLIC open-source repository.** Never commit any of the following:

- Business plans, financial data, revenue projections, pricing
- Personal names, emails, phone numbers, addresses
- API keys, tokens, passwords, or secrets
- Content specific to any particular shop deployment
- Customer data, inventory data, sales records

## Architecture

RetailOS uses a **public OSS + private deployment repo** pattern:

- `retail-os` (this repo): Generic platform code. No shop-specific content.
- Private deployment repo: Shop config, admin docs, wrangler.toml, secrets.

## Where Things Go

| Content Type | Location |
|---|---|
| Auth system, API routes, UI components | This repo |
| Shop name, branding, landing page copy | Private repo (`shop.config.ts`) |
| Admin documents (business plans, etc.) | Private repo (`worker/docs/`) |
| Database IDs, API keys | Private repo (`wrangler.toml` / secrets) |

## Before Every Commit

1. Does this file contain any shop-specific content? → Private repo
2. Does this file contain any personal information? → Private repo
3. Does this file contain any secrets? → Private repo
4. Is this generic platform code that any shop could use? → This repo
