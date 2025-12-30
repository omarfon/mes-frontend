# ✅ Conexión Angular - Backend MES Configurada

## 🎯 Resumen de Implementación

Se ha configurado exitosamente la conexión entre Angular y el backend MES con las siguientes implementaciones:

## 📦 Archivos Creados/Modificados

### ✨ Nuevos Archivos

1. **`src/environmets/environment.prod.ts`**
   - Configuración de producción
   - URL del backend de producción

2. **`src/app/core/services/api.service.ts`**
   - Servicio centralizado para todas las llamadas HTTP
   - Manejo de errores, timeouts y reintentos
   - Métodos para GET, POST, PUT, PATCH, DELETE
   - Soporte para upload/download de archivos

3. **`src/app/core/auth/error-interceptor.ts`**
   - Interceptor global para manejo de errores HTTP
   - Reintentos automáticos para errores de red
   - Redirección automática en errores 401

4. **`src/app/core/services/example-mes.service.ts`**
   - Servicio de ejemplo mostrando las mejores prácticas
   - Patrón a seguir para nuevos servicios

5. **`src/app/core/components/connection-test.component.ts`**
   - Componente para verificar la conexión con el backend
   - Útil para debugging y pruebas

6. **`proxy.conf.json`**
   - Configuración de proxy para desarrollo
   - Evita problemas de CORS

7. **`BACKEND-CONNECTION.md`**
   - Documentación completa de la conexión
   - Guía de uso y troubleshooting

### 🔧 Archivos Modificados

1. **`src/environmets/environments.ts`**
   - Agregados endpoints específicos del MES
   - Configuración de timeout y logs

2. **`src/app/app.config.ts`**
   - Agregado ErrorInterceptor a la cadena de interceptores

3. **`src/app/core/auth/auth.service.ts`**
   - Actualizado para usar endpoints configurados

4. **`package.json`**
   - Agregados scripts para usar proxy
   - Script de build de producción

## 🚀 Características Implementadas

### ✅ Servicios Centralizados
- **ApiService**: Servicio base para todas las peticiones HTTP
- Construcción automática de URLs
- Manejo centralizado de errores
- Soporte completo para CRUD operations
- Upload/Download de archivos

### ✅ Interceptores HTTP
- **AuthInterceptor**: Agrega JWT automáticamente
- **ErrorInterceptor**: Manejo global de errores
- Reintentos automáticos para errores de red
- Redirección automática en sesiones expiradas

### ✅ Configuración de Entornos
- Separación clara entre desarrollo y producción
- URLs configurables
- Endpoints predefinidos por módulo
- Logs habilitados solo en desarrollo

### ✅ Proxy de Desarrollo
- Evita problemas de CORS
- Configuración automática
- Transparent para el código

### ✅ Manejo de Errores
- Mensajes de error descriptivos
- Logging solo en desarrollo
- Reintentos automáticos para errores de red
- Timeouts configurables

## 📋 Endpoints Configurados

```typescript
endpoints: {
  auth: '/auth',                    // Autenticación
  production: '/production-orders', // Órdenes de producción
  maintenance: '/maintenance',      // Mantenimiento
  quality: '/quality',             // Control de calidad
  inventory: '/inventory',         // Inventario
  masterData: '/master-data',      // Datos maestros
  traceability: '/traceability',   // Trazabilidad
  reports: '/reports',             // Reportes
  integrations: '/integrations',   // Integraciones
  admin: '/admin'                  // Administración
}
```

## 🎮 Cómo Usar

### 1. Configurar URL del Backend

Edita `src/environmets/environments.ts`:
```typescript
apiUrl: 'http://tu-servidor:3000/api'
```

### 2. Usar en tus Servicios

```typescript
import { inject } from '@angular/core';
import { ApiService } from '../core/services/api.service';

export class MiServicio {
  private api = inject(ApiService);

  getData() {
    return this.api.get('/endpoint');
  }

  createData(data: any) {
    return this.api.post('/endpoint', data);
  }
}
```

### 3. Iniciar el Proyecto

```bash
# Instalar dependencias (si es necesario)
npm install

# Iniciar con proxy (recomendado)
npm start

# La app estará en http://localhost:4200
```

## 🧪 Probar la Conexión

### Opción 1: Componente de Test
Usa el componente `ConnectionTestComponent` para verificar la conexión visualmente.

### Opción 2: Consola del Navegador
```typescript
// En cualquier servicio
this.api.checkHealth().subscribe({
  next: () => console.log('✅ Conectado'),
  error: () => console.error('❌ Error')
});
```

## ⚙️ Scripts NPM Disponibles

```bash
npm start              # Inicia con proxy (recomendado)
npm run start:no-proxy # Inicia sin proxy
npm run build          # Build de desarrollo
npm run build:prod     # Build de producción
npm test               # Ejecuta tests
```

## 🔍 Verificación

1. ✅ Backend corriendo en `http://localhost:3000`
2. ✅ Frontend iniciado con `npm start`
3. ✅ Proxy configurado en `proxy.conf.json`
4. ✅ Interceptores registrados en `app.config.ts`
5. ✅ ApiService disponible globalmente
6. ✅ Entornos configurados correctamente

## 📚 Documentación

Para más detalles, consulta:
- **[BACKEND-CONNECTION.md](BACKEND-CONNECTION.md)** - Guía completa de conexión
- **[example-mes.service.ts](src/app/core/services/example-mes.service.ts)** - Ejemplos de uso
- **[api.service.ts](src/app/core/services/api.service.ts)** - API del servicio

## ⚠️ Notas Importantes

1. **CORS**: El proxy solo funciona en desarrollo. En producción, el backend debe tener CORS configurado.

2. **Token JWT**: Se guarda en `localStorage` automáticamente después del login.

3. **Timeout**: Por defecto es 30 segundos. Puedes ajustarlo en `environments.ts`.

4. **Reintentos**: Solo se aplican a errores de red (status 0) o 503.

5. **Logs**: Solo se muestran en desarrollo (`enableDebugLogs: true`).

## 🎉 ¡Listo!

Tu aplicación Angular ahora está completamente conectada con el backend MES. Todos los módulos pueden usar el `ApiService` para comunicarse con el backend de forma estandarizada y segura.

---

**Fecha de implementación:** 27 de diciembre de 2025
