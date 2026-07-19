param(
    [string]$DllPath = "..\sonic site\Sonic Dream Colection\SonicDreamsCollection_Data\Managed\Assembly-CSharp.dll",
    [string]$NewBaseUrl = "http://127.0.0.1:3000",
    [switch]$DryRun
)

$originalUrl = "http://www.freegb.net/gbook/chaogarden/"
$originalBytes = [System.Text.Encoding]::Unicode.GetBytes($originalUrl)
$originalLen = $originalBytes.Length

# Build new URL - must end with same path structure as original
$newUrl = $NewBaseUrl.TrimEnd('/') + "/gbook/chaogarden/"
$newBytes = [System.Text.Encoding]::Unicode.GetBytes($newUrl)

$dllFullPath = Resolve-Path $DllPath -ErrorAction Stop
$dllBytes = [System.IO.File]::ReadAllBytes($dllFullPath)

$found = $false
for ($i = 0; $i -le $dllBytes.Length - $originalLen; $i++) {
    $match = $true
    for ($j = 0; $j -lt $originalLen; $j++) {
        if ($dllBytes[$i + $j] -ne $originalBytes[$j]) { $match = $false; break }
    }
    if ($match) {
        $found = $true
        Write-Host "Found original URL at byte offset: $i"
        Write-Host "Original: '$originalUrl' ($originalLen bytes)"
        Write-Host "New:      '$newUrl' ($($newBytes.Length) bytes)"

        if ($newBytes.Length -eq $originalLen) {
            Write-Host "Lengths match - performing direct replacement..."
            if (-not $DryRun) {
                for ($j = 0; $j -lt $newBytes.Length; $j++) {
                    $dllBytes[$i + $j] = $newBytes[$j]
                }
                [System.IO.File]::WriteAllBytes($dllFullPath, $dllBytes)
                Write-Host "DLL patched successfully!"
            } else {
                Write-Host "DRY RUN - no changes made."
            }
        } else {
            Write-Host "ERROR: Length mismatch! ($($newBytes.Length) vs $originalLen)"
            Write-Host "New URL must be exactly $originalLen bytes ($($originalLen / 2) characters)."
            Write-Host "Current new URL length: $($newBytes.Length) bytes ($($newBytes.Length / 2) characters)."
        }
        break
    }
}

if (-not $found) {
    Write-Host "Original URL not found in DLL!"
}
