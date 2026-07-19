Write-Host "=== Chao Garden - Déploiement ===" -ForegroundColor Green
Write-Host ""

$env:Path = "C:\Users\simon\AppData\Local\Programs\Git\bin;C:\Program Files\GitHub CLI;C:\Program Files\nodejs;" + $env:Path
Set-Location -LiteralPath $PSScriptRoot

Write-Host "Étape 1: Création du repo GitHub" -ForegroundColor Yellow
$repoName = Read-Host "Nom du repo GitHub (default: chao-garden)"
if (-not $repoName) { $repoName = "chao-garden" }

$result = gh repo create $repoName --public --source=. --remote=origin --push 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Repo créé et pushé !" -ForegroundColor Green
} else {
    Write-Host "Erreur: $result" -ForegroundColor Red
    Write-Host "Crée le repo manuellement sur https://github.com/new puis lance:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/TON_USER/$repoName.git" -ForegroundColor Cyan
    Write-Host "  git push -u origin master" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Étape 2: Déploiement Railway" -ForegroundColor Yellow
Write-Host "1. Va sur https://railway.app" -ForegroundColor Cyan
Write-Host "2. Clique 'New Project' -> 'Deploy from GitHub repo'" -ForegroundColor Cyan
Write-Host "3. Chosis 'chao-garden'" -ForegroundColor Cyan
Write-Host "4. Railway détecte automatiquement Node.js et lance le serveur" -ForegroundColor Cyan
Write-Host "5. Une fois déployé, va dans Settings -> Networking -> Generate Domain" -ForegroundColor Cyan
Write-Host "   pour obtenir une URL publique (ex: chao-garden.up.railway.app)" -ForegroundColor Cyan

Write-Host ""
Write-Host "Étape 3: Patch du DLL avec l'URL Railway" -ForegroundColor Yellow
$railwayUrl = Read-Host "Entre l'URL Railway (ex: https://chao-garden.up.railway.app)"
if ($railwayUrl) {
    $dllPath = Resolve-Path "..\sonic site\Sonic Dream Colection\SonicDreamsCollection_Data\Managed\Assembly-CSharp.dll"
    # Use the URL-length-matching approach
    $baseUrl = $railwayUrl.TrimEnd('/') + "/gbook/chaogarden/"
    
    Write-Host "Patch du DLL avec: $baseUrl" -ForegroundColor Cyan
    Write-Host "NOTE: L'URL doit faire exactement 39 caractères pour le patch direct." -ForegroundColor DarkGray
    Write-Host "Sinon il faudra utiliser la méthode hosts file (recommandé pour les utilisateurs)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=== Terminé ! ===" -ForegroundColor Green
Write-Host "Site: $railwayUrl" -ForegroundColor Cyan
Write-Host "API: $railwayUrl/gbook/chaogarden/api/users/:name/ascend" -ForegroundColor Cyan