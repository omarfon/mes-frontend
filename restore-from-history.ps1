$histBase = "c:\Users\ASUS\AppData\Roaming\Code\User\History"
$frontendBase = "c:\Users\ASUS\Documents\DESARROLLO\FRONTEND\mes-frontend"

# Encuentra todos los entries.json con master-data HTML del frontend
$allEntries = Get-ChildItem $histBase -Filter "entries.json" -Recurse
$found = @()
foreach ($f in $allEntries) {
    $raw = Get-Content $f.FullName -Raw -EA SilentlyContinue
    if ($raw -and $raw -match "mes-frontend" -and $raw -match "master-data" -and $raw -match "\.html") {
        $data = $raw | ConvertFrom-Json -EA SilentlyContinue
        if ($data -and $data.resource -match "master-data.*\.html") {
            $lastEntry = $data.entries | Select-Object -Last 1
            # Extrae la ruta local del recurso
            $localPath = $data.resource -replace "file:///c%3A", "C:" -replace "/", "\\"
            $localPath = [System.Uri]::UnescapeDataString($localPath)
            $found += [PSCustomObject]@{
                Resource = $data.resource
                Dir = $f.DirectoryName
                LastId = $lastEntry.id
                TS = $lastEntry.timestamp
                LocalPath = $localPath
            }
        }
    }
}

Write-Host "Found $($found.Count) master-data HTML files in history:"
$found | ForEach-Object {
    $fname = $_.Resource -replace '.*master-data/',''
    Write-Host "  $fname (TS: $($_.TS))"
}

Write-Host ""
Write-Host "--- RESTORING ---"

foreach ($item in $found) {
    $histFile = Join-Path $item.Dir $item.LastId
    if (Test-Path $histFile) {
        $content = Get-Content $histFile -Raw -Encoding UTF8
        if ($content -and $content.Length -gt 100) {
            Set-Content -Path $item.LocalPath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "RESTORED: $($item.LocalPath -replace '.*master-data/','')"
        } else {
            Write-Host "SKIP (empty): $($item.LocalPath -replace '.*master-data/','')"
        }
    } else {
        Write-Host "SKIP (file not found): $histFile"
    }
}

Write-Host ""
Write-Host "Done."
