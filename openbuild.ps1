$ErrorActionPreference = "Stop"

$LinuxOnlyMessage = "You can only build OrchidOS in Linux (Or Ubuntu WSL)... Sorry."

npm install

switch ($args[0]) {
  "build" {
    Write-Output "$LinuxOnlyMessage"
  }
  "build-linux" {
    Write-Output "$LinuxOnlyMessage"
  }
  "build-simulator" {
    node ./build/build.js
    npm run build-linux-arm
    npm run build-linux-arm64
    npm run build-linux-ia32
    npm run build-linux-x64
    npm run build-win-arm64
    npm run build-win-ia32
    npm run build-win-x64
    npm run build-mac-arm64
    npm run build-mac-x64
  }
  "build-all" {
    Write-Output "$LinuxOnlyMessage"
  }
  "dev" {
    node ./build/build.js
    npm run dev
  }
  "start" {
    npm start
  }
  default {
    Write-Output "$($MyInvocation.MyCommand.Name) {build|build-linux|build-simulator|build-all|dev|start}"
  }
}
