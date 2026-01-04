# Script para crear 10 registros de auditoría de prueba
Write-Host "Iniciando creación de auditorías..." -ForegroundColor Cyan

# Login
$loginBody = @{
    email = 'admin@admin.com'
    password = 'admin123'
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
    $token = $loginResult.access_token
    Write-Host "✔ Token obtenido" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "ℹ️ Continuando sin autenticación..." -ForegroundColor Yellow
    $token = $null
}

# Auditorías
$audits = @(
    @{ action = 'CREATE'; entityType = 'lot'; entityId = '2bc417bc-95ec-4363-8269-f45bd765845c'; description = 'Lote LOT-MP-001 creado'; module = 'traceability' },
    @{ action = 'UPDATE'; entityType = 'lot'; entityId = '2bc417bc-95ec-4363-8269-f45bd765845c'; description = 'Lote movido a almacén A1'; module = 'traceability' },
    @{ action = 'READ'; entityType = 'lot'; entityId = 'e084523e-4fdf-49f6-8096-c034b1d99803'; description = 'Inspección de calidad realizada'; module = 'quality' },
    @{ action = 'APPROVE'; entityType = 'lot'; entityId = 'e084523e-4fdf-49f6-8096-c034b1d99803'; description = 'Lote aprobado para producción'; module = 'quality' },
    @{ action = 'CREATE'; entityType = 'lot'; entityId = '155cf115-a15c-4313-8ba6-6917c518374c'; description = 'Lote producido en línea 2'; module = 'production' },
    @{ action = 'UPDATE'; entityType = 'order'; entityId = 'OP-2024-001'; description = 'Material consumido en orden de producción'; module = 'production' },
    @{ action = 'UPDATE'; entityType = 'genealogy'; entityId = '525e25c6-88c3-4876-9fb3-8279580be47f'; description = 'Relación de genealogía actualizada'; module = 'traceability' },
    @{ action = 'DELETE'; entityType = 'lot'; entityId = '3542f685-be36-4223-a907-a215cbbfff35'; description = 'Lote dividido en 3 sublotes'; module = 'traceability' },
    @{ action = 'UPDATE'; entityType = 'lot'; entityId = '5f9931e8-7c1d-41a3-a49d-fc858cc1bba5'; description = 'Lotes fusionados en lote maestro'; module = 'traceability' },
    @{ action = 'SEND'; entityType = 'lot'; entityId = '2319c4e7-8206-418b-a345-5fd6380ddcfd'; description = 'Lote enviado a cliente XYZ'; module = 'inventory' }
)

# Crear auditorías
$count = 0
foreach ($audit in $audits) {
    $body = $audit | ConvertTo-Json
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    if ($token) {
        $headers['Authorization'] = "Bearer $token"
    }
    
    try {
        $result = Invoke-RestMethod -Uri 'http://localhost:3000/api/audit' -Method POST -Body $body -Headers $headers
        $count++
        Write-Host "✅ $count/10 - $($audit.action) - $($audit.description)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error: $($audit.action) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✓ Proceso completado: $count auditorías creadas" -ForegroundColor Cyan
