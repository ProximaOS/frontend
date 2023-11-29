@echo off

SET TARGET_ARCH=x64

npm install

IF "%1"=="build" (
  node .\build\build.js
  npm run build-linux-%TARGET_ARCH%
) ELSE IF "%1"=="build-linux" (
  node .\build\build.js
  npm run build-linux-arm
  npm run build-linux-arm64
  npm run build-linux-ia32
  npm run build-linux-x64
) ELSE IF "%1"=="build-all" (
  node .\build\build.js
  npm run build-linux-arm
  npm run build-linux-arm64
  npm run build-linux-ia32
  npm run build-linux-x64
  npm run build-win-arm64
  npm run build-win-ia32
  npm run build-win-x64
  npm run build-mac-arm64
  npm run build-mac-x64
) ELSE IF "%1"=="dev" (
  node .\build\build.js
  npm run dev
) ELSE IF "%1"=="start" (
  npm start
) ELSE (
  echo Usage: %0% {build^|build-linux^|build-simulator^|build-all^|dev^|start}
)
