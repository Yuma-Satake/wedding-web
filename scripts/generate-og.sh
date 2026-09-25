#!/bin/sh
# 開発サーバーの /og をヘッドレスChromeで撮影し public/og.png に書き出す
set -eu

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
url="${OG_SOURCE_URL:-http://localhost:4321/og}"
out="$(cd "$(dirname "$0")/.." && pwd)/public/og.png"

if ! curl -sf -o /dev/null "$url"; then
  echo "$url に接続できません。先に開発サーバーを起動してください" >&2
  exit 1
fi

"$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=8000 --screenshot="$out" "$url"
echo "wrote $out"
