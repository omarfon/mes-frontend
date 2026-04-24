Write-Host "Generando datos de calidad..." -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api"

# Login
$login = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $login -ContentType "application/json"
$h = @{ Authorization = "Bearer $($auth.access_token)"; "Content-Type" = "application/json" }

Write-Host "Token obtenido" -ForegroundColor Green

# Crear inspecciones
$today = Get-Date
$c = 0

for ($i = 0; $i -lt 100; $i++) {
    $days = Get-Random -Minimum 0 -Maximum 30
    $date = $today.AddDays(-$days)
    $types = @("RAW_MATERIAL","IN_PROCESS","FINISHED_GOOD")
    $type = $types[(Get-Random -Minimum 0 -Maximum 3)]
    $statuses = @("PASSED","PASSED","PASSED","FAILED","PENDING")
    $status = $statuses[(Get-Random -Minimum 0 -Maximum 5)]
    
    $body = @{
        type = $type
        nodeId = [guid]::NewGuid().ToString()
        status = $status
        inspectionDate = $date.ToString("yyyy-MM-ddTHH:mm:ss")
        inspectedQuantity = Get-Random -Minimum 100 -Maximum 1000
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/quality/inspections" -Method POST -Body $body -Headers $h | Out-Null
        $c++
        if ($c % 20 -eq 0) { Write-Host "$c inspecciones..." -ForegroundColor Gray }
    }
    catch { }
}

Write-Host "Creadas $c inspecciones" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:4200/quality/dashboard" -ForegroundColor White
