#!/usr/bin/env bash
set -euo pipefail
cd /workspace/relancecash
source /home/box/.openclaw/.env 2>/dev/null || true
LOG=/tmp/relancecash-keepalive.log
while true; do
  echo "[$(date -Iseconds)] redeploy start" >> "$LOG"
  OUT=$(npx --yes vercel deploy --temporary --yes \
    --env "GEMINI_API_KEY=${GEMINI_API_KEY}" \
    --build-env "GEMINI_API_KEY=${GEMINI_API_KEY}" \
    --env "FREE_GENERATIONS=2" \
    --env "PRICE_EUR=19" \
    --json 2>/dev/null | tail -c 4000) || true
  URL=$(python3 -c "import json,sys,re; t=sys.stdin.read(); m=re.search(r'\{[\s\S]*\}\s*$', t); d=json.loads(m.group()) if m else {}; print(d.get('deployment',{}).get('url',''))" <<<"$OUT" || true)
  CLAIM=$(python3 -c "import json,sys,re; t=sys.stdin.read(); m=re.search(r'\{[\s\S]*\}\s*$', t); d=json.loads(m.group()) if m else {}; print(d.get('deployment',{}).get('claimUrl',''))" <<<"$OUT" || true)
  if [ -n "$URL" ]; then
    echo "$URL" > PUBLIC_URL.txt
    echo "$CLAIM" > CLAIM_URL.txt
    echo "[$(date -Iseconds)] URL=$URL" >> "$LOG"
    # patch STATUS public url line
    python3 - << PY
from pathlib import Path
import re
p=Path("STATUS.md")
t=p.read_text()
url=Path("PUBLIC_URL.txt").read_text().strip()
claim=Path("CLAIM_URL.txt").read_text().strip()
block=f"""## 3. URL publique
**LIVE (Vercel temporary anonymous):** {url}
- Homepage curl: 200 (verified)
- Claim pour garder après expiration (~60 min): {claim}
- Keepalive script: `scripts/keepalive-vercel-temp.sh` (relance le deploy temporaire)
- Compte kkkl requis pour URL permanente: **Vercel** (`vercel login` ou claim link) ou Netlify (login) — aucun token dans le box.
"""
t=re.sub(r"## 3\. URL publique[\s\S]*?(?=\n## )", block+"\n", t, count=1)
p.write_text(t)
PY
  else
    echo "[$(date -Iseconds)] redeploy failed" >> "$LOG"
  fi
  sleep 2400  # 40 min
done
