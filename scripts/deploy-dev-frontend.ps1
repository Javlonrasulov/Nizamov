# dev.sainur.uz uchun frontend: build + dist-dev ga yuklash.
# SINGLEFILE_BUILD: bitta index.html (JS/CSS ichida) — nginx /assets/*.js ni noto'g'ri
# qaytarsa ham ishlaydi (MIME text/html muammosi).

$ErrorActionPreference = "Stop"
$Server = "ubuntu@89.39.94.20"
$RemoteDir = "/var/www/nizamov/dist-dev"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Set-Location $Root
$env:VITE_API_URL = "https://dev.sainur.uz/api"
$env:SINGLEFILE_BUILD = "1"
npm run build

scp -o ConnectTimeout=30 "$Root\dist\index.html" "${Server}:${RemoteDir}/"

Write-Host "Tugadi (single-file build). Brauzerda Ctrl+F5."
