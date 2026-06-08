# RetailOS

A lightweight, open-source platform for small retail businesses. Built on Cloudflare Workers + D1 + Vite + React.

## Features

- **Email OTP auth** — passwordless login via magic link
- **Admin docs** — private markdown documents behind auth (content injected from deployment repo)
- **Public landing page** — configurable via shop config
- **Instance config pattern** — private deployment repo symlinks config into the OSS codebase

## Architecture

```
retail-os/          (this repo — public OSS, generic platform)
your-shop/          (private repo — config, content, secrets)
  ├── shop.config.ts
  ├── wrangler.toml
  ├── worker/
  │   ├── index.ts          (wrapper that injects DOCS)
  │   └── docs/*.md         (private admin documents)
  └── retail-os/            (git submodule)
```

## Quick Start

1. Clone this repo as a submodule in your private deployment repo
2. Create your `shop.config.ts` and symlink it to `retail-os/src/shops/local.config.ts`
3. Create a D1 database and run `schema.sql`
4. Set up `wrangler.toml` with your database binding and secrets
5. Deploy with `wrangler deploy`

## Privacy Policy

> **This is a PUBLIC repository. It must NEVER contain:**
> - Business plans, financial projections, or pricing data
> - Personal information (names, emails, addresses)
> - API keys, tokens, or secrets
> - Any content specific to a particular shop deployment
>
> All instance-specific content belongs in the private deployment repo.

## License

MIT
