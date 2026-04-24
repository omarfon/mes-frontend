# Generador de Datos para Dashboard de Calidad

## 📋 Requisitos Previos

1. **Backend corriendo** en `http://localhost:3000`
2. **Usuario admin** configurado con credenciales:
   - Username: `admin`
   - Password: `admin123`

## 🚀 Uso

### Paso 1: Iniciar el Backend

En una terminal separada, navega a tu proyecto backend y ejecuta:

```bash
npm run start:dev
```

### Paso 2: Generar Datos

Ejecuta el script PowerShell:

```powershell
.\generate-data.ps1
```

## 📊 Datos Generados

El script creará **100 inspecciones** distribuidas en los últimos 30 días con:

- **Tipos**: RAW_MATERIAL, IN_PROCESS, FINISHED_GOOD
- **Estados**: PASSED (60%), FAILED (20%), PENDING (20%)
- **Cantidades**: Entre 100 y 1000 unidades
- **Fechas**: Distribuidas aleatoriamente en los últimos 30 días

## 🎨 Ver el Dashboard

Una vez generados los datos, abre el dashboard en:

```
http://localhost:4200/quality/dashboard
```

## 📝 Datos Manuales Adicionales

Si también quieres crear Severidades, Familias y Defectos, usa estas peticiones:

### Severidades

```json
POST http://localhost:3000/api/quality/severities
{
  "code": "SEV-CRI",
  "name": "Crítico",
  "level": 1,
  "color": "#EF4444"
}
```

### Familias de Defectos

```json
POST http://localhost:3000/api/quality/defect-families
{
  "code": "FAM-DIM",
  "name": "Dimensional",
  "description": "Defectos dimensionales"
}
```

### Defectos

```json
POST http://localhost:3000/api/quality/defects
{
  "code": "DEF-001",
  "name": "Fuera de medida",
  "familyId": "<ID_FAMILIA>",
  "severityId": "<ID_SEVERIDAD>"
}
```

## 🔧 Troubleshooting

### Error: "No es posible conectar con el servidor remoto"

**Solución**: Verifica que el backend esté corriendo en el puerto 3000:

```bash
curl http://localhost:3000/api
```

### Error: "401 Unauthorized"

**Solución**: Verifica las credenciales del usuario admin en el backend.

### Dashboard muestra "No hay datos"

**Solución**: 
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña Network
3. Verifica que las peticiones a `/api/quality/inspections` retornen datos
4. Si retorna 401, regenera el token haciendo login

## 📈 Visualizaciones del Dashboard

El dashboard mostrará:

- **KPIs**:
  - Total de inspecciones
  - Tasa de aprobación
  - Total de defectos
  - Defectos críticos

- **Gráficos**:
  - Inspecciones por tipo
  - Defectos por familia
  - Top 5 defectos más frecuentes
  - Inspecciones recientes (últimas 10)

- **Filtros**:
  - Hoy
  - Esta semana
  - Este mes
  - Este trimestre
  - Este año
