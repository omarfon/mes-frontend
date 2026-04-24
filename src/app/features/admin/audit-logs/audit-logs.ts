import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditEntry, AuditModule, AuditAction, AuditSeverity } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
})
export class AuditLogsComponent {
  q = '';
  filterModule: AuditModule | 'ALL' = 'ALL';
  filterAction: AuditAction | 'ALL' = 'ALL';
  filterSeverity: AuditSeverity | 'ALL' = 'ALL';
  filterStatus: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ALL' = 'ALL';
  filterUser = '';
  filterDateFrom = '';
  filterDateTo = '';
  selectedId: string | null = null;

  readonly moduleOptions: { value: AuditModule | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos los módulos' },
    { value: 'PRODUCCION', label: 'Producción' },
    { value: 'CALIDAD', label: 'Calidad' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'INVENTARIO', label: 'Inventario' },
    { value: 'TRAZABILIDAD', label: 'Trazabilidad' },
    { value: 'REPORTES', label: 'Reportes' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'INTEGRACION', label: 'Integración' },
  ];

  readonly actionOptions: { value: AuditAction | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'STATUS_CHANGE', label: 'Cambio de estado' },
    { value: 'BLOCK', label: 'Bloqueo' },
    { value: 'RELEASE', label: 'Liberación' },
    { value: 'APPROVE', label: 'Aprobación' },
    { value: 'REJECT', label: 'Rechazo' },
    { value: 'CLOSE', label: 'Cierre' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'EXPORT', label: 'Exportación' },
    { value: 'ACCESS_DENIED', label: 'Acceso denegado' },
  ];

  constructor(private auditService: AuditLogService) {}

  get allLogs(): AuditEntry[] {
    return this.auditService.getEntries();
  }

  get filtered(): AuditEntry[] {
    const t = this.q.trim().toLowerCase();
    const u = this.filterUser.trim().toLowerCase();
    return this.allLogs.filter(e => {
      if (this.filterModule !== 'ALL' && e.module !== this.filterModule) return false;
      if (this.filterAction !== 'ALL' && e.action !== this.filterAction) return false;
      if (this.filterSeverity !== 'ALL' && e.severity !== this.filterSeverity) return false;
      if (this.filterStatus !== 'ALL' && e.status !== this.filterStatus) return false;
      if (u && !e.username.toLowerCase().includes(u) && !e.fullName.toLowerCase().includes(u)) return false;
      if (this.filterDateFrom && e.timestamp < this.filterDateFrom) return false;
      if (this.filterDateTo && e.timestamp > this.filterDateTo + 'T23:59:59Z') return false;
      if (t && ![e.username, e.resource, e.resourceId, e.details].join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }

  get selected(): AuditEntry | null {
    return this.allLogs.find(e => e.id === this.selectedId) ?? null;
  }

  get todayCount(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.allLogs.filter(e => e.timestamp.startsWith(today)).length;
  }

  get criticalCount(): number {
    return this.allLogs.filter(e => e.severity === 'CRITICAL').length;
  }

  get failedCount(): number {
    return this.allLogs.filter(e => e.status === 'FAILURE' || e.status === 'DENIED').length;
  }

  get deniedCount(): number {
    return this.allLogs.filter(e => e.status === 'DENIED').length;
  }

  select(e: AuditEntry) {
    this.selectedId = this.selectedId === e.id ? null : e.id;
  }

  clearFilters() {
    this.q = '';
    this.filterModule = 'ALL';
    this.filterAction = 'ALL';
    this.filterSeverity = 'ALL';
    this.filterStatus = 'ALL';
    this.filterUser = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
  }

  exportCsv() {
    const headers = ['ID', 'Timestamp', 'Usuario', 'Nombre', 'Rol', 'Módulo', 'Acción', 'Severidad', 'Recurso', 'ID Recurso', 'Estado', 'IP', 'Sesión', 'Detalles'];
    const rows = this.filtered.map(e => [
      e.id, e.timestamp, e.username, e.fullName, e.role,
      e.module, e.action, e.severity, e.resource, e.resourceId,
      e.status, e.ip, e.sessionId,
      `"${(e.details ?? '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  severityBadge(s: AuditSeverity): string {
    return {
      INFO: 'bg-slate-700 text-slate-300',
      WARNING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      CRITICAL: 'bg-red-500/10 text-red-400 border border-red-500/20',
    }[s] ?? '';
  }

  severityIcon(s: AuditSeverity): string {
    return { INFO: 'pi-info-circle text-slate-400', WARNING: 'pi-exclamation-triangle text-amber-400', CRITICAL: 'pi-exclamation-circle text-red-400' }[s] ?? '';
  }

  actionBadge(a: AuditAction): string {
    const m: Record<AuditAction, string> = {
      CREATE: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      UPDATE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      DELETE: 'bg-red-500/10 text-red-400 border border-red-500/20',
      STATUS_CHANGE: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      BLOCK: 'bg-red-600/20 text-red-300 border border-red-600/30',
      RELEASE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      APPROVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      REJECT: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      CLOSE: 'bg-slate-600/30 text-slate-300 border border-slate-600/40',
      LOGIN: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      LOGOUT: 'bg-slate-700 text-slate-400',
      EXPORT: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      ACCESS_DENIED: 'bg-red-700/20 text-red-300 border border-red-700/30',
    };
    return m[a] ?? '';
  }

  actionLabel(a: AuditAction): string {
    const m: Record<AuditAction, string> = {
      CREATE: 'Crear', UPDATE: 'Actualizar', DELETE: 'Eliminar',
      STATUS_CHANGE: 'Cambio estado', BLOCK: 'Bloquear', RELEASE: 'Liberar',
      APPROVE: 'Aprobar', REJECT: 'Rechazar', CLOSE: 'Cerrar',
      LOGIN: 'Login', LOGOUT: 'Logout', EXPORT: 'Exportar',
      ACCESS_DENIED: 'Acceso denegado',
    };
    return m[a] ?? a;
  }

  statusBadge(s: string): string {
    return {
      SUCCESS: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      FAILURE: 'bg-red-500/10 text-red-400 border border-red-500/20',
      DENIED: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    }[s] ?? '';
  }

  moduleLabel(m: AuditModule): string {
    return {
      PRODUCCION: 'Producción', CALIDAD: 'Calidad', MANTENIMIENTO: 'Mantenimiento',
      INVENTARIO: 'Inventario', TRAZABILIDAD: 'Trazabilidad', REPORTES: 'Reportes',
      ADMIN: 'Admin', AUTH: 'Auth', INTEGRACION: 'Integración',
    }[m] ?? m;
  }

  formatTs(ts: string): string {
    return new Date(ts).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  rowClass(e: AuditEntry): string {
    if (e.severity === 'CRITICAL') return 'border-l-2 border-red-500/50';
    if (e.severity === 'WARNING') return 'border-l-2 border-amber-500/40';
    return 'border-l-2 border-transparent';
  }
}
