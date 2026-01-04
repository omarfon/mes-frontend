import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environmets/environments';

/**
 * Interceptor para manejo de errores HTTP globales
 * - Maneja errores 401 (no autenticado)
 * - Maneja errores 403 (no autorizado)
 * - Reintentos automáticos para errores de red
 * - Logging de errores en desarrollo
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private readonly maxRetries = 2;
  private readonly retryDelay = 1000; // 1 segundo

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      // Reintentar solo para errores de red (no para 4xx o 5xx)
      retry({
        count: this.maxRetries,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Solo reintentar para errores de red (status 0) o 503 (servicio no disponible)
          if (error.status === 0 || error.status === 503) {
            if (environment.enableDebugLogs) {
              console.log(`Reintentando petición (${retryCount}/${this.maxRetries})...`);
            }
            return timer(this.retryDelay * retryCount);
          }
          // Para otros errores, no reintentar
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.enableDebugLogs) {
          console.error('Error HTTP interceptado:', error);
        }

        // Manejar diferentes tipos de errores
        switch (error.status) {
          case 401:
            // No autenticado - redirigir al login
            // EXCEPCIÓN: No redirigir si es un endpoint que aún no está implementado
            const skipRedirectUrls = [
              '/traceability/serials',
              '/quality/defects',
              '/quality/defect-families',
              '/quality/severities'
            ];
            const shouldSkipRedirect = skipRedirectUrls.some(url => error.url?.includes(url));
            
            if (!shouldSkipRedirect) {
              console.error('Sesión expirada o no autenticado');
              // Restaurando la eliminación del token en caso de error
              localStorage.removeItem('access_token');
              localStorage.removeItem('current_user');
              this.router.navigate(['/auth/login']);
            } else {
              console.log('ℹ️ Endpoint no implementado o requiere configuración:', error.url);
            }
            break;

          case 403:
            // No autorizado - usuario no tiene permisos
            console.error('No tienes permisos para realizar esta acción');
            break;

          case 404:
            console.error('Recurso no encontrado');
            break;

          case 500:
            console.error('Error interno del servidor');
            break;

          case 503:
            console.error('Servicio no disponible');
            break;

          case 0:
            console.error('Error de conexión - verifica tu conexión de red');
            break;

          default:
            console.error(`Error ${error.status}: ${error.message}`);
        }

        return throwError(() => error);
      })
    );
  }
}
