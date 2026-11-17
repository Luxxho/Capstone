$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "VetMap Mobile - Preparacion"
Write-Host "==========================="
Write-Host ""

if (-not (Test-Path ".\package.json")) {
    throw "Ejecuta este archivo dentro de la carpeta ProyectoVetMap\mobile"
}

Write-Host "Instalando dependencias..."
npm install

Write-Host ""
Write-Host "Ajustando dependencias a Expo..."
npx expo install --fix

Write-Host ""
Write-Host "Revisando Expo..."
npx expo-doctor@latest

Write-Host ""
Write-Host "Listo."
Write-Host "Para iniciar:"
Write-Host "npx expo start -c"
