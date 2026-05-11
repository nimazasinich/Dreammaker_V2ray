#!/usr/bin/env bash
# =============================================================
# DreamMaker — Cloudflare Workers Deploy Script
# Compatible with: wrangler.toml / wrangler-tier1.toml / wrangler-tier2.toml
# Usage:
#   ./deploy.sh              — deploy all tiers
#   ./deploy.sh tier0        — deploy Tier 0 only
#   ./deploy.sh tier1        — deploy Tier 1 only
#   ./deploy.sh tier2        — deploy Tier 2 only
# =============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# ── 1. Hardcoded credentials ────────────────────────────────
export CLOUDFLARE_API_TOKEN="cfut_9X9JcNyxRKrZTwKg8fdQ2ua26ftC6nk5ltQeurdwbd919108"
export CLOUDFLARE_ACCOUNT_ID="d902b91f0f1076e0601ffd6e7b4382c0"

# Telegram secrets
TG_BOT_TOKEN="7437859619:AAH-2MJdlNmNf7ZSlj16zf-g0QJqB-TIxJU"
TG_CHAT_ID="6301194182"

# Tier 2 secrets (جایگزین کن با مقادیر واقعی)
ADMIN_TOKEN="REPLACE_WITH_STRONG_ADMIN_PASSWORD_MIN_32_CHARS"
JWT_SECRET="REPLACE_WITH_LONG_RANDOM_JWT_SECRET_MIN_32_CHARS"

# D1 database ID (جایگزین کن با مقدار واقعی)
CF_D1_DATABASE_ID="REPLACE_WITH_D1_DATABASE_ID"

# ── 2. Guard: required vars ──────────────────────────────────
if [ -z "${CLOUDFLARE_API_TOKEN}" ]; then
  echo "[ERROR] CLOUDFLARE_API_TOKEN is not set."
  exit 1
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID}" ]; then
  echo "[ERROR] CLOUDFLARE_ACCOUNT_ID is not set."
  exit 1
fi

# ── 3. Guard: required files ─────────────────────────────────
for f in config.ts edge-worker-tier0.ts helper-ecosystem-tier1.ts \
          control-plane-tier2.ts wrangler.toml wrangler-tier1.toml \
          wrangler-tier2.toml; do
  if [ ! -f "$ROOT_DIR/$f" ]; then
    echo "[ERROR] Missing required file: $f"
    exit 1
  fi
done

# ── 4. Install wrangler if missing ───────────────────────────
if ! command -v wrangler &>/dev/null; then
  echo "[INFO] wrangler not found — installing via npm..."
  npm install --prefer-offline --no-audit wrangler
  WRANGLER="npx wrangler"
else
  WRANGLER="wrangler"
fi

echo "[INFO] wrangler: $($WRANGLER --version 2>&1 | head -1)"

# ── 5. Helper: deploy with retry ─────────────────────────────
deploy_with_retry() {
  local config_file="$1"
  local max_retries=3
  local retry_delay=30

  for i in $(seq 1 $max_retries); do
    echo "[INFO] Deploy attempt $i/$max_retries for $config_file..."
    if $WRANGLER deploy --config "$config_file" 2>&1; then
      return 0
    else
      if [ "$i" -lt "$max_retries" ]; then
        echo "[WARN] Attempt $i failed. Waiting ${retry_delay}s before retry..."
        sleep "$retry_delay"
      else
        echo "[ERROR] All $max_retries attempts failed for $config_file"
        return 1
      fi
    fi
  done
}

# ── 6. Push secret with retry ────────────────────────────────
push_secret_with_retry() {
  local secret_name="$1"
  local secret_value="$2"
  local config_file="$3"
  local max_retries=3
  local retry_delay=15

  for i in $(seq 1 $max_retries); do
    echo "[INFO] Pushing secret $secret_name (attempt $i/$max_retries)..."
    if echo "${secret_value}" | \
        $WRANGLER secret put "$secret_name" \
          --config "$config_file" 2>&1; then
      echo "[OK] Secret $secret_name pushed"
      return 0
    else
      if [ "$i" -lt "$max_retries" ]; then
        echo "[WARN] Secret push failed. Waiting ${retry_delay}s..."
        sleep "$retry_delay"
      else
        echo "[ERROR] Failed to push secret $secret_name after $max_retries attempts"
        return 1
      fi
    fi
  done
}

# ── 7. Decide what to deploy ─────────────────────────────────
TARGET="${1:-all}"

deploy_tier0() {
  echo ""
  echo "━━━ Tier 0 — Edge Worker ━━━"
  deploy_with_retry "$ROOT_DIR/wrangler.toml"
  echo "[OK] Tier 0 deployed"
}

deploy_tier1() {
  echo ""
  echo "━━━ Tier 1 — Helper Ecosystem ━━━"
  deploy_with_retry "$ROOT_DIR/wrangler-tier1.toml"

  if [ -n "${TG_BOT_TOKEN:-}" ]; then
    push_secret_with_retry "TG_BOT_TOKEN" "${TG_BOT_TOKEN}" "$ROOT_DIR/wrangler-tier1.toml"
  fi
  if [ -n "${TG_CHAT_ID:-}" ]; then
    push_secret_with_retry "TG_CHAT_ID" "${TG_CHAT_ID}" "$ROOT_DIR/wrangler-tier1.toml"
  fi
  echo "[OK] Tier 1 deployed"
}

deploy_tier2() {
  echo ""
  echo "━━━ Tier 2 — Control Plane ━━━"

  if grep -q "REPLACE_D1_ID" "$ROOT_DIR/wrangler-tier2.toml"; then
    if [ -z "${CF_D1_DATABASE_ID:-}" ] || [ "${CF_D1_DATABASE_ID}" = "REPLACE_WITH_D1_DATABASE_ID" ]; then
      echo "[WARN] CF_D1_DATABASE_ID is still a placeholder — skipping Tier 2."
      echo "       Create a D1 database first:"
      echo "       wrangler d1 create dreammaker-db"
      echo "       Then update CF_D1_DATABASE_ID in this script and re-run."
      return 0
    fi
    TMPTOML="$(mktemp)"
    sed "s/REPLACE_D1_ID/${CF_D1_DATABASE_ID}/g" \
        "$ROOT_DIR/wrangler-tier2.toml" > "$TMPTOML"
    deploy_with_retry "$TMPTOML"
    rm -f "$TMPTOML"
  else
    deploy_with_retry "$ROOT_DIR/wrangler-tier2.toml"
  fi

  if [ -n "${ADMIN_TOKEN:-}" ] && [ "${ADMIN_TOKEN}" != "REPLACE_WITH_STRONG_ADMIN_PASSWORD_MIN_32_CHARS" ]; then
    push_secret_with_retry "ADMIN_TOKEN" "${ADMIN_TOKEN}" "$ROOT_DIR/wrangler-tier2.toml"
  fi
  if [ -n "${JWT_SECRET:-}" ] && [ "${JWT_SECRET}" != "REPLACE_WITH_LONG_RANDOM_JWT_SECRET_MIN_32_CHARS" ]; then
    push_secret_with_retry "JWT_SECRET" "${JWT_SECRET}" "$ROOT_DIR/wrangler-tier2.toml"
  fi
  if [ -n "${TG_BOT_TOKEN:-}" ]; then
    push_secret_with_retry "TG_BOT_TOKEN" "${TG_BOT_TOKEN}" "$ROOT_DIR/wrangler-tier2.toml"
  fi
  if [ -n "${TG_CHAT_ID:-}" ]; then
    push_secret_with_retry "TG_CHAT_ID" "${TG_CHAT_ID}" "$ROOT_DIR/wrangler-tier2.toml"
  fi
  echo "[OK] Tier 2 deployed"
}

# ── 8. Run ───────────────────────────────────────────────────
case "$TARGET" in
  tier0) deploy_tier0 ;;
  tier1) deploy_tier1 ;;
  tier2) deploy_tier2 ;;
  all)
    deploy_tier0
    sleep 10
    deploy_tier1
    sleep 10
    deploy_tier2
    ;;
  *)
    echo "[ERROR] Unknown target: $TARGET"
    echo "        Usage: $0 [tier0|tier1|tier2|all]"
    exit 1
    ;;
esac

echo ""
echo "✓ All deployments completed."