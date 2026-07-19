param(
    [switch]$NoHosts
)

Write-Host "=== Chao Garden Revival Server ===" -ForegroundColor Green
Write-Host ""

$env:Path = "C:\Program Files\nodejs;" + $env:Path
Set-Location -LiteralPath $PSScriptRoot

# Kill existing server on port 3000
$existing = netstat -ano | Select-String ":3000 "
foreach ($line in $existing) {
    $parts = $line -split '\s+'
    $pid = $parts[$parts.Length - 1]
    if ($pid -and $pid -ne '0') {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 1

# Start the server
Write-Host "Starting server..." -ForegroundColor Yellow
$p = Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "server.js" -NoNewWindow -PassThru
Start-Sleep -Seconds 2

if ($p.HasExited) {
    Write-Host "Server failed to start!" -ForegroundColor Red
    exit 1
}

Write-Host "Server running at http://localhost:3000" -ForegroundColor Green

# Ask about hosts file
if (-not $NoHosts) {
    Write-Host ""
    Write-Host "Recommended: Add hosts file entry so the game (without patched DLL) connects to this server." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would you like to add '127.0.0.1  www.freegb.net' to your hosts file?" -ForegroundColor Cyan
    Write-Host "(Requires administrator privileges)" -ForegroundColor DarkGray
    Write-Host "Press Y for Yes, N for No, or C to skip: " -ForegroundColor Cyan -NoNewline
    $key = [Console]::ReadKey($true).Key

    if ($key -eq 'Y') {
        try {
            $hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
            $entry = "127.0.0.1  www.freegb.net"
            $content = Get-Content $hostsFile -Raw
            if ($content -match [regex]::Escape($entry)) {
                Write-Host "Hosts entry already exists." -ForegroundColor DarkGray
            } else {
                Add-Content -Path $hostsFile -Value "`n$entry" -Force
                Write-Host "Hosts entry added!" -ForegroundColor Green
                Write-Host "The game can now connect to the Chao Garden server without a patched DLL." -ForegroundColor Green
            }
        } catch {
            Write-Host "Failed to modify hosts file. Try running as Administrator." -ForegroundColor Red
        }
    } elseif ($key -eq 'C') {
        Write-Host "Skipped."
    } else {
        Write-Host "Skipped."
    }
}

Write-Host ""
Write-Host "=== Server ready! ===" -ForegroundColor Green
Write-Host "Homepage:     http://localhost:3000/" -ForegroundColor Cyan
Write-Host "API (angels): http://localhost:3000/api/angels" -ForegroundColor Cyan
Write-Host "Game API:     POST http://localhost:3000/gbook/chaogarden/api/users/:name/ascend" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to stop the server..." -ForegroundColor DarkGray
[Console]::ReadKey($true) | Out-Null
Stop-Process -Id $p.Id -Force
Write-Host "Server stopped." -ForegroundColor Red
