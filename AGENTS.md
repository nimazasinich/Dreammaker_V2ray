# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is an infrastructure/configuration repository for **DreamMaker VPN** — a VLESS proxy service using Cloudflare Workers + Xray-core. There is no `package.json`, no build toolchain, and no test framework. Workers are standalone `.js` files deployed via `wrangler`.

### Key services

| Service | Directory | Dev command | Notes |
|---|---|---|---|
| **tier0** (subscriptions, health) | `ACTIVE/` | `wrangler dev --config wrangler-tier0.toml --local` | Fetch handler for `/health`, `/sub`, `/ping` |
| **edge-ws-relay-v4** (traffic relay) | `ACTIVE/` | `wrangler dev --config wrangler.toml --local` | Requires `src/worker.js` symlink (see below) |
| **tier1** (health monitor) | `ACTIVE/` | N/A (scheduled worker, no fetch handler) | Test via `curl localhost:8787/cdn-cgi/handler/scheduled` |
| **bot** (Telegram sales bot) | `bot/` | `wrangler dev --config wrangler-bot.toml --local` | Needs `BOT_TOKEN_ENV` secret for real Telegram API |

### Running workers locally

All workers run in the `ACTIVE/` directory using `wrangler dev --local` (no Cloudflare auth needed for local mode).

For `edge-ws-relay-v4`, the `wrangler.toml` expects `main = "src/worker.js"`. Create a symlink before running:
```bash
mkdir -p ACTIVE/src && ln -sf /workspace/ACTIVE/worker.js ACTIVE/src/worker.js
wrangler dev --config wrangler.toml --local
```
Clean up afterwards: `rm -rf ACTIVE/src`

### Validation

- **JS syntax**: `node --check <file.js>` for any worker file
- **JSON configs**: `node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"`
- **TOML configs**: Validated automatically by `wrangler dev`

### Gotchas

- No linter or test framework is configured in this repo. Validation is done via `node --check` for JS syntax and JSON.parse for configs.
- Workers use Cloudflare KV bindings which are automatically stubbed in `--local` mode.
- Deployment to production requires `CLOUDFLARE_API_TOKEN` (see `REFERENCE/TOKENS_AND_SECRETS_REGISTRY.md`). Never commit tokens.
- The main worker's `wrangler.toml` references `src/worker.js` but the actual file lives at `ACTIVE/worker.js` — a symlink is needed for local dev.
- See `PRIORITY.md` and `REFERENCE/QUICKSTART.md` for architecture overview and deployment procedures.
