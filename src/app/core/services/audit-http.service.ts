import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environmets/environments';

export interface AuditRecord {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'APPROVE' | 'REJECT' | 'BLOCK' | 'UNBLOCK';
  entityType: string;
  entityId: string;
  userId: string | null;
  user: { id: string; email: string; nombre?: string } | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  description: string | null;
  ipAddress: string | null;
  module: string | null;
  fechaCreacion: string;
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATE: 'Creado',
  UPDATE: 'Modificado',
  DELETE: 'Eliminado',
  VIEW: 'Consultado',
  EXPORT: 'Exportado',
  APPROVE: 'Aprobado',
  REJECT: 'Rechazado',
  BLOCK: 'Bloqueado',
  UNBLOCK: 'Desbloqueado',
};

export const AUDIT_ACTION_CLASSES: Record<string, string> = {
  CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
  APPROVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REJECT: 'bg-red-500/10 text-red-400 border-red-500/30',
  BLOCK: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  UNBLOCK: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

@Injectable({ providedIn: 'root' })
export class AuditHttpService {
  private readonly base = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getByEntity(entityType: string, entityId: string): Observable<AuditRecord[]> {
    return this.http.get<AuditRecord[]>(
      `${this.base}/entity/${entityType}/${entityId}`
    );
  }
}
