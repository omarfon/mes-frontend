import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Interceptor de autenticación (funcional)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  // Eliminando la verificación del token
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};

// Interceptor de errores (funcional)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error HTTP:', error);

      // Manejar errores específicos
      if (error.status === 401) {
        // No autenticado - redirigir al login
        // EXCEPCIÓN: No redirigir si es un endpoint que aún no está implementado
        const skipRedirectUrls = [
          '/traceability/serials', 
          '/traceability/events', 
          '/audit',
          '/quality/defects',
          '/quality/defect-families',
          '/quality/severities'
        ];
        const shouldSkipRedirect = skipRedirectUrls.some(url => error.url?.includes(url));
        
        if (!shouldSkipRedirect) {
          console.error('Sesión expirada - redirigiendo al login');
          router.navigate(['/auth/login']);
        } else {
          console.log('ℹ️ Endpoint no implementado:', error.url);
        }
      } else if (error.status === 403) {
        // No autorizado
        console.error('Acceso denegado');
      } else if (error.status === 0) {
        // Error de red
        console.error('Error de red - verificar conexión al backend');
      }

      return throwError(() => error);
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
  ],
};