# Script pour ajouter l'entrée hosts pointant vers le serveur Chao Garden
# À exécuter en tant qu'Administrateur

$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$serverIp = "SERVER_IP_ADDRESS"  # Remplace par l'IP du serveur déployé
$serverHost = "www.freegb.net"

$entry = "$serverIp  $serverHost"

$content = Get-Content $hostsFile -Raw -ErrorAction SilentlyContinue
if (-not $content) { $content = "" }

if ($content -match [regex]::Escape($entry)) {
    Write-Host "L'entrée existe déjà dans le fichier hosts." -ForegroundColor Yellow
} else {
    Add-Content -Path $hostsFile -Value "`n$entry" -Force
    Write-Host "Entrée ajoutée au fichier hosts !" -ForegroundColor Green
    Write-Host "  $entry" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Le jeu peut maintenant se connecter au serveur Chao Garden" -ForegroundColor Green
    Write-Host "(aucune modification du jeu nécessaire)" -ForegroundColor Green
}
