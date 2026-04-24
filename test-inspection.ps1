# Script de prueba para crear una inspección via API
# Ejecutar: .\test-inspection.ps1

$baseUrl = "http://localhost:3000/api/quality/inspections"

# DTO según el backend
$inspectionDto = @{
    type = "INCOMING"
    nodeId = "NODE-TEST-001"
    status = "PENDING"
    inspectedQuantity = 100
    notes = "Prueba de integración desde PowerShell"
} | ConvertTo-Json

Write-Host "🔄 Enviando POST a: $baseUrl" -ForegroundColor Cyan
Write-Host "📦 DTO:" -ForegroundColor Yellow
Write-Host $inspectionDto

try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post `
        -Body $inspectionDto `
        -ContentType "application/json" `
        -Headers @{
            "Authorization" = "Bearer YOUR_TOKEN_HERE"
        }
    
    Write-Host "✅ Inspección creada exitosamente!" -ForegroundColor Green
    Write-Host "📋 Respuesta del servidor:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "❌ Error al crear inspección:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Respuesta del servidor:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
