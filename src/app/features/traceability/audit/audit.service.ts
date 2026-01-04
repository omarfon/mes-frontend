import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  PRINT = 'PRINT',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}

export interface CreateAuditDto {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  oldValues?: any;
  newValues?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  module?: string;
  metadata?: any;
}

export interface Audit extends CreateAuditDto {
  id: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Audit[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          console.log('📦 Auditorías (array directo):', response.length);
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          console.log('📦 Auditorías (paginado):', response.data.length);
          return response.data;
        }
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        return [];
      }),
      catchError(err => {
        if (err.status === 401) {
          console.log('ℹ️ Endpoint /audit requiere autenticación - devolviendo array vacío');
          return of([]);
        }
        throw err;
      })
    );
  }

  getById(id: string): Observable<Audit> {
    return this.http.get<Audit>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateAuditDto): Observable<Audit> {
    return this.http.post<Audit>(this.apiUrl, dto);
  }

  // Búsqueda por entidad
  getByEntity(entityType: string, entityId: string): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.apiUrl}/entity/${entityType}/${entityId}`);
  }

  // Búsqueda por acción
  getByAction(action: AuditAction): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.apiUrl}/action/${action}`);
  }

  // Búsqueda por usuario
  getByUser(userId: string): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Búsqueda por módulo
  getByModule(module: string): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.apiUrl}/module/${module}`);
  }
}
