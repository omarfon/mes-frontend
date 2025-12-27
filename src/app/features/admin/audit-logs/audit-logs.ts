import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  module: string;
  action: string;
  resource: string;
  ip: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
})
export class AuditLogsComponent {
  logs: AuditLog[] = [
    { id: 1, timestamp: '2025-01-13 09:45:23', user: 'admin', module: 'Producción', action: 'CREATE', resource: 'Orden de Producción OP-1234', ip: '192.168.1.10', status: 'SUCCESS', details: 'Orden creada con éxito' },
    { id: 2, timestamp: '2025-01-13 10:12:45', user: 'operator1', module: 'Calidad', action: 'UPDATE', resource: 'Inspección QC-5678', ip: '192.168.1.15', status: 'SUCCESS', details: 'Resultado actualizado a NO CONFORME' },
    { id: 3, timestamp: '2025-01-13 10:30:11', user: 'supervisor', module: 'Mantenimiento', action: 'DELETE', resource: 'Plan Preventivo PM-99', ip: '192.168.1.20', status: 'FAILURE', details: 'Error: Plan tiene tareas pendientes' },
    { id: 4, timestamp: '2025-01-13 11:05:37', user: 'almacenista', module: 'Inventarios', action: 'CREATE', resource: 'Movimiento MOV-1001', ip: '192.168.1.25', status: 'SUCCESS', details: 'Entrada de materia prima registrada' },
    { id: 5, timestamp: '2025-01-13 11:45:02', user: 'admin', module: 'Admin', action: 'UPDATE', resource: 'Usuario operator2', ip: '192.168.1.10', status: 'SUCCESS', details: 'Estado cambiado a ACTIVE' },
    { id: 6, timestamp: '2025-01-13 12:20:15', user: 'operator1', module: 'Producción', action: 'UPDATE', resource: 'Orden OP-1234', ip: '192.168.1.15', status: 'SUCCESS', details: 'Estado actualizado a EN_EJECUCION' },
    { id: 7, timestamp: '2025-01-13 13:00:48', user: 'supervisor', module: 'Calidad', action: 'CREATE', resource: 'Inspección QC-5679', ip: '192.168.1.20', status: 'SUCCESS', details: 'Inspección creada para lote LOT-789' },
    { id: 8, timestamp: '2025-01-13 13:45:20', user: 'almacenista', module: 'Inventarios', action: 'UPDATE', resource: 'Transferencia TRF-100', ip: '192.168.1.25', status: 'SUCCESS', details: 'Transferencia aprobada' },
  ];

  q: string = '';
  filterModule: string = 'ALL';
  filterAction: string = 'ALL';
  filterStatus: string = 'ALL';
  filterDateFrom: string = '';
  filterDateTo: string = '';
  selectedLog: AuditLog | null = null;

  modules = ['ALL', 'Producción', 'Calidad', 'Mantenimiento', 'Inventarios', 'Trazabilidad', 'Reportes', 'Admin'];
  actions = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

  get filteredLogs() {
    return this.logs.filter(log => {
      const matchQ = !this.q || log.user.toLowerCase().includes(this.q.toLowerCase()) || 
                      log.resource.toLowerCase().includes(this.q.toLowerCase());
      const matchModule = this.filterModule === 'ALL' || log.module === this.filterModule;
      const matchAction = this.filterAction === 'ALL' || log.action === this.filterAction;
      const matchStatus = this.filterStatus === 'ALL' || log.status === this.filterStatus;
      return matchQ && matchModule && matchAction && matchStatus;
    });
  }

  selectLog(log: AuditLog) {
    this.selectedLog = this.selectedLog?.id === log.id ? null : log;
  }

  getStatusBadge(status: string) {
    return status === 'SUCCESS'
      ? 'ui-badge text-green-300 bg-green-500/10 border-green-500/20'
      : 'ui-badge text-red-300 bg-red-500/10 border-red-500/20';
  }

  getActionBadge(action: string) {
    const map: Record<string, string> = {
      CREATE: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      UPDATE: 'ui-badge text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
      DELETE: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20',
      LOGIN: 'ui-badge text-purple-300 bg-purple-500/10 border-purple-500/20',
      LOGOUT: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20'
    };
    return map[action] || 'ui-badge';
  }
}
