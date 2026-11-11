@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
where node >nul 2>&1 || goto no_node
node -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)" || goto old_node
if not exist .env (
  node -e "const fs=require('fs'),c=require('crypto');fs.writeFileSync('.env',['NODE_ENV=development','PORT=3000','SESSION_SECRET='+c.randomBytes(48).toString('base64url'),'TRUST_PROXY=0','PGLITE_DIR=./data/pglite',''].join('\n'))" || goto failed
  echo Создан .env со случайным ключом сессии.
)
if not exist node_modules\express\package.json (
  echo Устанавливаю зависимости. Для первого запуска нужен интернет.
  call npm ci || goto failed
)
if not defined PORT (
  for /f "tokens=1,* delims==" %%A in ('findstr /b "PORT=" .env') do set "PORT=%%B"
)
if not defined PORT set "PORT=3000"
start "" cmd /c "timeout /t 3 /nobreak ^>nul ^& start http://localhost:%PORT%/start"
call npm start
if errorlevel 1 goto failed
goto end
:no_node
echo Не найден Node.js 20 или новее. Установи Node.js с https://nodejs.org/
goto wait
:old_node
echo Нужен Node.js 20 или новее. Установи актуальную версию с https://nodejs.org/
goto wait
:failed
echo Запуск завершился с ошибкой. Прочитай сообщение выше и проверь .env и интернет.
:wait
pause
:end
endlocal
