#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Не найден Node.js 20+. Установи его с https://nodejs.org/"; read -r _; exit 1; }
node -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)" || { echo "Нужен Node.js 20+. Установи актуальную версию с https://nodejs.org/"; read -r _; exit 1; }
if [ ! -f .env ]; then
  node -e "const fs=require('fs'),c=require('crypto');fs.writeFileSync('.env',['NODE_ENV=development','PORT=3000','SESSION_SECRET='+c.randomBytes(48).toString('base64url'),'TRUST_PROXY=0','PGLITE_DIR=./data/pglite',''].join('\n'))"
  echo "Создан .env со случайным ключом сессии."
fi
if [ ! -f node_modules/express/package.json ]; then
  echo "Устанавливаю зависимости. Для первого запуска нужен интернет."
  npm ci || { echo "Не удалось установить зависимости."; read -r _; exit 1; }
fi
launch_port=${PORT:-}
if [ -z "$launch_port" ] && [ -f .env ]; then
  launch_port=$(sed -n 's/^PORT=//p' .env | head -n 1)
fi
launch_port=${launch_port:-3000}
(sleep 3; if command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:${launch_port}/start"; elif command -v open >/dev/null 2>&1; then open "http://localhost:${launch_port}/start"; fi) >/dev/null 2>&1 &
npm start || { echo "Запуск завершился с ошибкой. Проверь .env и вывод выше."; read -r _; exit 1; }
