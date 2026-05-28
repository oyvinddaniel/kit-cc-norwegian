#!/bin/bash
# ═══════════════════════════════════════════════════
# Kit CC Monitor — Rens for distribusjon
# Dobbeltklikk denne filen for å rydde opp
# ═══════════════════════════════════════════════════

cd "$(dirname "$0")"

echo ""
echo "🧹 Renser Kit CC Monitor for distribusjon..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Fjern node_modules
if [ -d "node_modules" ]; then
  echo "🗑  Sletter node_modules/ ..."
  rm -rf node_modules
  echo "   ✅ Fjernet"
else
  echo "   ℹ️  node_modules/ finnes ikke — OK"
fi

# Fjern package-lock.json (valgfritt, men gir renere pakke)
if [ -f "package-lock.json" ]; then
  echo "🗑  Sletter package-lock.json ..."
  rm package-lock.json
  echo "   ✅ Fjernet"
fi

# Fjern testdatabase
DBPATH="../.ai/backlog.db"
if [ -f "$DBPATH" ]; then
  echo "🗑  Sletter testdatabase (.ai/backlog.db) ..."
  rm -f "$DBPATH" "${DBPATH}-wal" "${DBPATH}-shm"
  echo "   ✅ Fjernet"
else
  echo "   ℹ️  Ingen testdatabase funnet — OK"
fi

# Fjern macOS søppelfiler
find . -name ".DS_Store" -delete 2>/dev/null
find .. -maxdepth 1 -name ".DS_Store" -delete 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ferdig! Kit CC Monitor er klar for distribusjon."
echo ""
echo "Kunden kjører bare:  npm install && node server.js"
echo ""
read -p "Trykk Enter for å lukke..."
