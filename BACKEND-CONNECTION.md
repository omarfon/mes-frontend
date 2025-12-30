# Configuración de Conexión con Backend MES

Este documento explica cómo está configurada la conexión entre el frontend Angular y el backend MES.

## 📋 Configuración de Entornos

### Desarrollo (`environments.ts`)
```typescript
apiUrl: 'http://localhost:3000/api'
```

### Producción (`environment.prod.ts`)
```typescript
apiUrl: 'https://api-mes.tuempresa.com/api'
```

**🔧 Para cambiar la URL del backend:**
1. Edita el archivo correspondiente en `src/environmets/`
2. Actualiza el valor de `apiUrl` con la URL de tu servidor
3. Reinicia el servidor de desarrollo

## 🔌 Endpoints Configurados

El sistema tiene los siguientes endpoints predefinidos:

- `/auth` - Autenticación y autorización
- `/production-orders` - Órdenes de producción
- `/maintenance` - Mantenimiento
- `/quality` - Control de calidad
- `/inventory` - Inventario
- `/master-data` - Datos maestros
- `/traceability` - Trazabilidad
- `/reports` - Reportes
- `/integrations` - Integraciones
- `/admin` - Administración

## 🛠️ Servicios Centralizados

### ApiService
Servicio centralizado para todas las llamadas HTTP. Ubicado en:
```
src/app/core/services/api.service.ts
```

**Características:**
- ✅ Construcción automática de URLs
- ✅ Manejo centralizado de errores
- ✅ Timeout configurable (30 segundos por defecto)
- ✅ Soporte para GET, POST, PUT, PATCH, DELETE
- ✅ Descarga de archivos (PDF, Excel, etc.)
- ✅ Upload de archivos con FormData
- ✅ Construcción de parámetros HTTP
- ✅ Reintentos automáticos para errores de red

### Ejemplo de Uso

```typescript
import { inject } from '@angular/core';
import { ApiService } from '../core/services/api.service';

export class MiServicio {
  private api = inject(ApiService);

  // GET con parámetros
  obtenerDatos(filtros: any) {
    const params = this.api.buildParams(filtros);
    return this.api.get('/mi-endpoint', { params });
  }

  // POST
  crearRecurso(data: any) {
    return this.api.post('/mi-endpoint', data);
  }

  // PUT
  actualizarRecurso(id: string, data: any) {
    return this.api.put(`/mi-endpoint/${id}`, data);
  }

  // DELETE
  eliminarRecurso(id: string) {
    return this.api.delete(`/mi-endpoint/${id}`);
  }

  // Descargar archivo
  descargarReporte() {
    return this.api.downloadFile('/reportes/descargar');
  }

  // Upload archivo
  subirArchivo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.uploadFile('/archivos/subir', formData);
  }
}
```

## 🔐 Interceptores HTTP

### AuthInterceptor
Agrega automáticamente el token JWT a todas las peticiones.

```typescript
Authorization: Bearer <token>
```

### ErrorInterceptor
Maneja errores HTTP de forma global:

- **401** - Sesión expirada → Redirige al login
- **403** - Sin permisos → Muestra mensaje de error
- **404** - Recurso no encontrado
- **500** - Error del servidor
- **503** - Servicio no disponible
- **0** - Error de red → Reintentos automáticos

**Reintentos automáticos:**
- Máximo 2 reintentos
- Solo para errores de red (status 0) o 503
- Delay de 1 segundo entre reintentos

## 🌐 Proxy de Desarrollo

Durante el desarrollo, se usa un proxy para evitar problemas de CORS.

**Configuración:** `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

**Scripts de NPM:**
```bash
# Con proxy (recomendado para desarrollo)
npm start

# Sin proxy
npm run start:no-proxy

# Build de producción
npm run build:prod
```

## 🚀 Iniciar el Proyecto

### 1. Verificar configuración del backend
Asegúrate de que el backend esté corriendo en:
```
http://localhost:3000
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npm start
```

La aplicación estará disponible en:
```
http://localhost:4200
```

### 4. Verificar conexión
El servicio ApiService incluye un método `checkHealth()` para verificar la conexión:

```typescript
this.api.checkHealth().subscribe({
  next: () => console.log('✅ Conectado al backend'),
  error: () => console.error('❌ Error de conexión')
});
```

## 📝 Crear Nuevos Servicios

Sigue este patrón para crear servicios que consuman el backend:

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../environmets/environments';

@Injectable({
  providedIn: 'root'
})
export class MiNuevoServicio {
  private api = inject(ApiService);
  
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getData(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.get(`${environment.endpoints.production}/data`).pipe(
      tap({
        next: () => this.loading.set(false),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message);
        }
      })
    );
  }
}
```

## 🔍 Debugging

### Logs en desarrollo
Los logs están habilitados automáticamente en desarrollo:
```typescript
environment.enableDebugLogs = true
```

Verás en la consola:
- Errores HTTP detallados
- Información de reintentos
- Detalles de errores de autenticación

### Deshabilitar logs en producción
En producción, los logs están deshabilitados:
```typescript
environment.enableDebugLogs = false
```

## 📦 Estructura de Archivos

```
src/
├── environmets/
│   ├── environments.ts          # Configuración de desarrollo
│   └── environment.prod.ts      # Configuración de producción
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts           # Servicio HTTP centralizado
│   │   │   └── example-mes.service.ts   # Ejemplo de uso
│   │   └── auth/
│   │       ├── auth.service.ts          # Autenticación
│   │       ├── auth-interceptor.ts      # Interceptor de autenticación
│   │       └── error-interceptor.ts     # Interceptor de errores
│   └── app.config.ts            # Configuración de la app
└── proxy.conf.json              # Configuración de proxy
```

## ⚠️ Problemas Comunes

### Error de CORS
**Solución:** Asegúrate de estar usando el proxy:
```bash
npm start  # Con proxy
```

### Error 401 en todas las peticiones
**Solución:** Verifica que el token se esté guardando correctamente:
```typescript
localStorage.getItem('access_token')
```

### Backend no responde
**Solución:** Verifica que el backend esté corriendo:
```bash
# En la terminal del backend
npm run start:dev
```

### Timeout en las peticiones
**Solución:** Ajusta el timeout en `environments.ts`:
```typescript
timeout: 60000  // 60 segundos
```

## 🔗 URLs de Conexión

### Desarrollo
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`

### Producción
- Frontend: `https://mes.tuempresa.com`
- Backend API: `https://api-mes.tuempresa.com/api`

## 📞 Soporte

Si tienes problemas de conexión:
1. Verifica que el backend esté corriendo
2. Revisa los logs en la consola del navegador
3. Verifica la configuración en `environments.ts`
4. Comprueba que el proxy esté configurado correctamente

---

**Última actualización:** 27 de diciembre de 2025
