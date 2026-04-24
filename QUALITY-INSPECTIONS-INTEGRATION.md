# Integración de Inspecciones - Quality Module

## ✅ Estado Actual

La integración frontend-backend para inspecciones de calidad está **completamente implementada**.

## 📋 Cambios Realizados

### 1. Modelos TypeScript (`quality.model.ts`)
- ✅ Agregado `nodeId` opcional a la interfaz `Inspection`
- ✅ Agregados campos compatibles con backend en DTOs:
  - `nodeId?: string`
  - `status?: InspectionStatus`
  - `inspectedQuantity?: number`
  - `notes?: string`
- ✅ Creado alias `InspectionStatus` = `InspectionResult`

### 2. API Service (`quality.api.service.ts`)
- ✅ Métodos CRUD completos:
  - `getInspections()` → GET /quality/inspections
  - `getInspectionById(id)` → GET /quality/inspections/:id
  - `createInspection(dto)` → POST /quality/inspections
  - `updateInspection(id, dto)` → PATCH /quality/inspections/:id
  - `deleteInspection(id)` → DELETE /quality/inspections/:id

### 3. Store Service (`quality-store.service.ts`)
- ✅ Auto-carga de inspecciones en constructor
- ✅ Mapeo de DTO frontend → backend en `createInspection()`:
  ```typescript
  {
    type: dto.type,
    nodeId: dto.nodeId || dto.lotId || dto.productionOrderId || dto.productId,
    status: dto.status || dto.result,
    inspectedQuantity: dto.inspectedQuantity || dto.quantityInspected,
    notes: dto.notes || dto.observations
  }
  ```
- ✅ BehaviorSubject reactivo `inspections$`
- ✅ Métodos CRUD completos

### 4. Componente (`inspections.ts` + `inspections.html`)
- ✅ Formulario con campo `nodeId`
- ✅ Listado reactivo con `list$ | async`
- ✅ Muestra `nodeId` en la tabla
- ✅ CRUD completo: crear, editar, eliminar

## 🔗 Endpoints Backend (esperados)

```
GET    /api/quality/inspections          - Listar todas
GET    /api/quality/inspections/:id      - Obtener por ID
POST   /api/quality/inspections          - Crear nueva
PATCH  /api/quality/inspections/:id      - Actualizar
DELETE /api/quality/inspections/:id      - Eliminar
```

## 📦 DTO Backend Esperado (CreateInspectionDto)

```typescript
{
  type: InspectionType;           // REQUIRED
  nodeId: string;                 // REQUIRED - ID del nodo de trazabilidad
  status?: InspectionStatus;      // OPTIONAL - PENDING | APPROVED | REJECTED | CONDITIONAL
  inspectedQuantity?: number;     // OPTIONAL
  notes?: string;                 // OPTIONAL
}
```

## 🧪 Pruebas

### Verificar Backend (PowerShell)
```powershell
# GET - Listar inspecciones
Invoke-RestMethod -Uri "http://localhost:3000/api/quality/inspections" -Method Get

# POST - Crear inspección (con token)
$body = @{
    type = "INCOMING"
    nodeId = "NODE-TRAZ-001"
    status = "PENDING"
    inspectedQuantity = 100
    notes = "Prueba de integración"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/quality/inspections" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" }
```

### Probar desde UI
1. Abrir http://localhost:4200/quality/inspections
2. Completar formulario:
   - Código: `INS-001`
   - Node ID: `NODE-TRAZ-123` ⭐ (campo nuevo)
   - Tipo: `INCOMING`
   - Inspector: Tu ID
   - Fecha: Hoy
3. Guardar y verificar en DevTools → Network → POST `/quality/inspections`

## 📊 Flujo de Datos

```
1. Usuario abre /quality/inspections
   ↓
2. QualityStoreService.constructor() ejecuta loadInspections()
   ↓
3. API GET /quality/inspections → carga datos en inspections$
   ↓
4. Componente muestra lista reactiva (list$ | async)
   ↓
5. Usuario crea nueva inspección
   ↓
6. DTO frontend se mapea a DTO backend
   ↓
7. POST /quality/inspections
   ↓
8. Backend responde con inspección creada
   ↓
9. Store actualiza inspections$ automáticamente
   ↓
10. Lista se actualiza reactivamente
```

## ✅ Checklist de Verificación

- [x] Modelos TypeScript actualizados
- [x] API Service con métodos CRUD
- [x] Store Service con mapeo de DTOs
- [x] Componente con formulario completo
- [x] Campo `nodeId` en UI
- [x] Carga automática desde backend
- [x] Reactivity con BehaviorSubjects
- [ ] Backend corriendo en puerto 3000
- [ ] Prueba E2E: crear → listar → editar → eliminar

## 🚀 Siguiente Paso

**Arrancar el backend NestJS:**
```bash
cd ../backend  # o donde esté tu proyecto NestJS
npm run start:dev
```

Luego verificar que las inspecciones se carguen automáticamente en http://localhost:4200/quality/inspections
