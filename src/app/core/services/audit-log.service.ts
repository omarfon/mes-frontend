import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AuditModule =
  | 'PRODUCCION' | 'CALIDAD' | 'MANTENIMIENTO' | 'INVENTARIO'
  | 'TRAZABILIDAD' | 'ADMIN' | 'AUTH' | 'REPORTES' | 'INTEGRACION';

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE'
  | 'LOGIN' | 'LOGOUT' | 'EXPORT'
  | 'BLOCK' | 'RELEASE' | 'APPROVE' | 'REJECT' | 'CLOSE' | 'ACCESS_DENIED';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  fullName: string;
  role: string;
  module: AuditModule;
  action: AuditAction;
  severity: AuditSeverity;
  resource: string;
  resourceId: string;
  before?: string;
  after?: string;
  ip: string;
  sessionId: string;
  status: 'SUCCESS' | 'FAILURE' | 'DENIED';
  details: string;
}

const SEED: AuditEntry[] = [
  // AUTH
  { id: 'aud-001', timestamp: '2026-04-19T06:02:11Z', userId: 'u-01', username: 'admin', fullName: 'Administrador Sistema', role: 'Administrador', module: 'AUTH', action: 'LOGIN', severity: 'INFO', resource: 'Sesión', resourceId: 'ses-001', ip: '192.168.1.10', sessionId: 'ses-001', status: 'SUCCESS', details: 'Inicio de sesión exitoso desde IP corporativa.' },
  { id: 'aud-002', timestamp: '2026-04-19T06:15:44Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'AUTH', action: 'LOGIN', severity: 'INFO', resource: 'Sesión', resourceId: 'ses-002', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'Inicio de sesión exitoso.' },
  { id: 'aud-003', timestamp: '2026-04-19T06:18:30Z', userId: 'u-UNKNOWN', username: 'jramirez', fullName: 'Desconocido', role: '—', module: 'AUTH', action: 'LOGIN', severity: 'WARNING', resource: 'Sesión', resourceId: '', ip: '10.0.0.55', sessionId: '', status: 'FAILURE', details: 'Credenciales incorrectas. Usuario no reconocido. Intento bloqueado.' },
  { id: 'aud-004', timestamp: '2026-04-19T06:20:05Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'AUTH', action: 'LOGIN', severity: 'INFO', resource: 'Sesión', resourceId: 'ses-003', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'Inicio de sesión exitoso.' },

  // PRODUCCION
  { id: 'aud-005', timestamp: '2026-04-19T06:35:00Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'PRODUCCION', action: 'CREATE', severity: 'INFO', resource: 'Orden de Producción', resourceId: 'OP-2026-0347', before: undefined, after: '{"orderCode":"OP-2026-0347","product":"PT-ALG-CH","qty":1200,"status":"PENDIENTE"}', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'Orden de producción OP-2026-0347 creada. Producto: Hilo Algodón Combed 30/1, qty 1200 kg.' },
  { id: 'aud-006', timestamp: '2026-04-19T07:02:18Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'PRODUCCION', action: 'STATUS_CHANGE', severity: 'INFO', resource: 'Orden de Producción', resourceId: 'OP-2026-0345', before: '{"status":"PENDIENTE"}', after: '{"status":"EN_EJECUCION"}', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'OP-2026-0345 cambiada a EN_EJECUCION. Operador asignado: clopez.' },
  { id: 'aud-007', timestamp: '2026-04-19T08:45:00Z', userId: 'u-05', username: 'clopez', fullName: 'Carlos López', role: 'Operador Producción', module: 'PRODUCCION', action: 'UPDATE', severity: 'INFO', resource: 'Orden de Producción', resourceId: 'OP-2026-0347', before: '{"progress":0}', after: '{"progress":15,"notes":"Inicio cardado"}', ip: '192.168.1.44', sessionId: 'ses-005', status: 'SUCCESS', details: 'Progreso actualizado a 15%. Nota: Inicio cardado.' },
  { id: 'aud-008', timestamp: '2026-04-19T09:10:00Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'PRODUCCION', action: 'STATUS_CHANGE', severity: 'WARNING', resource: 'Orden de Producción', resourceId: 'OP-2026-0345', before: '{"status":"EN_EJECUCION"}', after: '{"status":"EN_ESPERA","reason":"Defecto gramaje detectado"}', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'OP-2026-0345 puesta EN ESPERA por defecto de gramaje detectado en tejido. NC-2026-0011 abierta.' },
  { id: 'aud-009', timestamp: '2026-04-18T17:55:30Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'PRODUCCION', action: 'STATUS_CHANGE', severity: 'INFO', resource: 'Orden de Producción', resourceId: 'OP-2026-0338', before: '{"status":"EN_EJECUCION"}', after: '{"status":"COMPLETADA"}', ip: '192.168.1.22', sessionId: 'ses-010', status: 'SUCCESS', details: 'OP-2026-0338 marcada COMPLETADA. 620 MT aprobados, 180 MT reproceso.' },
  { id: 'aud-010', timestamp: '2026-04-18T10:30:00Z', userId: 'u-06', username: 'fmorales', fullName: 'Felipe Morales', role: 'Almacenista', module: 'PRODUCCION', action: 'ACCESS_DENIED', severity: 'WARNING', resource: 'Orden de Producción — Eliminar', resourceId: 'OP-2026-0333', ip: '192.168.1.50', sessionId: 'ses-009', status: 'DENIED', details: 'Intento de eliminar OP-2026-0333 rechazado. Rol "Almacenista" no tiene permiso DELETE en Producción.' },

  // CALIDAD
  { id: 'aud-011', timestamp: '2026-04-19T07:30:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'CREATE', severity: 'INFO', resource: 'Inspección', resourceId: 'INS-2026-0052', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'Inspección INS-2026-0052 creada para OP-2026-0347 — Preparación. Resultado APROBADO.' },
  { id: 'aud-012', timestamp: '2026-04-19T08:15:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'CREATE', severity: 'WARNING', resource: 'No Conformidad', resourceId: 'NC-2026-0011', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'NC-2026-0011 abierta. Severidad MAJOR. Desviación de gramaje en tejido Mezclilla 12oz. Inspección origen: INS-2026-0050.' },
  { id: 'aud-013', timestamp: '2026-04-19T09:00:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'BLOCK', severity: 'CRITICAL', resource: 'Lote (Bloqueo Calidad)', resourceId: 'LOT-WIP-0088', before: '{"status":"LIBRE"}', after: '{"status":"BLOQUEADO","reason":"NC-2026-0011"}', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'Lote LOT-WIP-0088 bloqueado por calidad. Vinculado a NC-2026-0011. 420 MT retenidos.' },
  { id: 'aud-014', timestamp: '2026-04-19T09:30:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'STATUS_CHANGE', severity: 'INFO', resource: 'No Conformidad', resourceId: 'NC-2026-0007', before: '{"status":"OPEN"}', after: '{"status":"ANALYSIS"}', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'NC-2026-0007 avanzada a estado ANALYSIS. Nota: Inicia análisis de causa raíz con método 5WHY.' },
  { id: 'aud-015', timestamp: '2026-04-18T14:45:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'REJECT', severity: 'CRITICAL', resource: 'Decisión de Calidad', resourceId: 'LOT-PT-0108', before: '{"decision":"PENDING"}', after: '{"decision":"REJECTED","qty":300}', ip: '192.168.1.31', sessionId: 'ses-007', status: 'SUCCESS', details: 'Decisión RECHAZO para lote LOT-PT-0108. 300 kg. Resultado inspección INS-2026-0041: RECHAZADO. NC abierta.' },
  { id: 'aud-016', timestamp: '2026-04-18T15:10:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'APPROVE', severity: 'INFO', resource: 'Decisión de Calidad', resourceId: 'LOT-PT-0095', before: '{"decision":"PENDING"}', after: '{"decision":"APPROVED","qty":500}', ip: '192.168.1.31', sessionId: 'ses-007', status: 'SUCCESS', details: 'Lote LOT-PT-0095 aprobado para despacho. 500 kg.' },
  { id: 'aud-017', timestamp: '2026-04-18T16:00:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'CLOSE', severity: 'INFO', resource: 'No Conformidad', resourceId: 'NC-2026-0003', before: '{"status":"VERIFICATION"}', after: '{"status":"CLOSED"}', ip: '192.168.1.31', sessionId: 'ses-007', status: 'SUCCESS', details: 'NC-2026-0003 cerrada tras verificación. Reproceso efectivo. 620 MT liberados.' },
  { id: 'aud-018', timestamp: '2026-04-19T10:05:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'CALIDAD', action: 'RELEASE', severity: 'INFO', resource: 'Lote (Cuarentena)', resourceId: 'LOT-WIP-0034', before: '{"status":"CUARENTENA"}', after: '{"status":"LIBERADO","verdict":"APROBADO"}', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'Lote LOT-WIP-0034 liberado de cuarentena. Resultado APROBADO. Responsable: mgarcia.' },

  // MANTENIMIENTO
  { id: 'aud-019', timestamp: '2026-04-18T11:00:00Z', userId: 'u-04', username: 'rtorres', fullName: 'Roberto Torres', role: 'Técnico Mantenimiento', module: 'MANTENIMIENTO', action: 'CREATE', severity: 'INFO', resource: 'Orden de Trabajo', resourceId: 'OT-CORR-0041', ip: '192.168.1.61', sessionId: 'ses-006', status: 'SUCCESS', details: 'OT correctiva OT-CORR-0041 creada. Máquina: CT-BOB — Sensor tensión. Detectado en inspección INS-2026-0040.' },
  { id: 'aud-020', timestamp: '2026-04-18T15:30:00Z', userId: 'u-04', username: 'rtorres', fullName: 'Roberto Torres', role: 'Técnico Mantenimiento', module: 'MANTENIMIENTO', action: 'STATUS_CHANGE', severity: 'INFO', resource: 'Orden de Trabajo', resourceId: 'OT-CORR-0041', before: '{"status":"EN_EJECUCION"}', after: '{"status":"CERRADA","duration":270}', ip: '192.168.1.61', sessionId: 'ses-006', status: 'SUCCESS', details: 'OT-CORR-0041 cerrada. Duración: 4h 30min. Acción: Recalibración sensor BOB-003. Firma técnico: rtorres.' },
  { id: 'aud-021', timestamp: '2026-04-19T07:00:00Z', userId: 'u-04', username: 'rtorres', fullName: 'Roberto Torres', role: 'Técnico Mantenimiento', module: 'MANTENIMIENTO', action: 'CREATE', severity: 'INFO', resource: 'Orden de Trabajo Preventiva', resourceId: 'OT-PREV-0015', ip: '192.168.1.61', sessionId: 'ses-004', status: 'SUCCESS', details: 'OT preventiva OT-PREV-0015 creada. Máquina: CT-HIL. Lubricación programada según plan PM-Q2-2026.' },
  { id: 'aud-022', timestamp: '2026-04-18T09:20:00Z', userId: 'u-04', username: 'rtorres', fullName: 'Roberto Torres', role: 'Técnico Mantenimiento', module: 'MANTENIMIENTO', action: 'CLOSE', severity: 'INFO', resource: 'Orden de Trabajo Preventiva', resourceId: 'OT-PREV-0012', before: '{"status":"EN_EJECUCION"}', after: '{"status":"CERRADA"}', ip: '192.168.1.61', sessionId: 'ses-008', status: 'SUCCESS', details: 'OT-PREV-0012 cerrada. Lubricación completada. Sin anomalías.' },

  // INVENTARIO
  { id: 'aud-023', timestamp: '2026-04-19T06:50:00Z', userId: 'u-06', username: 'fmorales', fullName: 'Felipe Morales', role: 'Almacenista', module: 'INVENTARIO', action: 'CREATE', severity: 'INFO', resource: 'Movimiento Inventario', resourceId: 'MOV-2026-1015', ip: '192.168.1.50', sessionId: 'ses-009', status: 'SUCCESS', details: 'Entrada de MP registrada. Proveedor: TEXTIL SAC. Lote: MP-COT-0341. Qty: 1200 kg Algodón Combed.' },
  { id: 'aud-024', timestamp: '2026-04-19T08:00:00Z', userId: 'u-06', username: 'fmorales', fullName: 'Felipe Morales', role: 'Almacenista', module: 'INVENTARIO', action: 'APPROVE', severity: 'INFO', resource: 'Transferencia', resourceId: 'TRF-2026-0089', ip: '192.168.1.50', sessionId: 'ses-009', status: 'SUCCESS', details: 'Transferencia TRF-0089 aprobada. Origen: ALM-MP-01 → Destino: CT-PREP. Qty: 1200 kg.' },
  { id: 'aud-025', timestamp: '2026-04-18T13:00:00Z', userId: 'u-06', username: 'fmorales', fullName: 'Felipe Morales', role: 'Almacenista', module: 'INVENTARIO', action: 'CREATE', severity: 'WARNING', resource: 'Ajuste de Inventario', resourceId: 'AJU-2026-0021', before: '{"stock":450}', after: '{"stock":420,"diff":-30}', ip: '192.168.1.50', sessionId: 'ses-008', status: 'SUCCESS', details: 'Ajuste de inventario de -30 kg en PT-HIL-20. Motivo: Merma producción OP-2026-0342.' },

  // TRAZABILIDAD
  { id: 'aud-026', timestamp: '2026-04-18T14:50:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'TRAZABILIDAD', action: 'BLOCK', severity: 'CRITICAL', resource: 'Cuarentena', resourceId: 'QR-2026-004', before: '{"status":"LIBRE"}', after: '{"status":"CUARENTENA","qty":300}', ip: '192.168.1.31', sessionId: 'ses-007', status: 'SUCCESS', details: 'Lote LOT-PT-0108 ingresado a cuarentena. 300 kg. Motivo: rechazo inspección final INS-2026-0041.' },
  { id: 'aud-027', timestamp: '2026-04-19T10:10:00Z', userId: 'u-03', username: 'mgarcia', fullName: 'María García', role: 'Inspector Calidad', module: 'TRAZABILIDAD', action: 'REJECT', severity: 'CRITICAL', resource: 'Cuarentena — Disposición', resourceId: 'QR-2026-004', before: '{"status":"CUARENTENA"}', after: '{"status":"RECHAZADO","verdict":"SCRAP"}', ip: '192.168.1.31', sessionId: 'ses-003', status: 'SUCCESS', details: 'Lote LOT-PT-0108 disposición SCRAP confirmada. Responsable: mgarcia. NC-2026-0007 avanzada.' },

  // ADMIN
  { id: 'aud-028', timestamp: '2026-04-17T09:00:00Z', userId: 'u-01', username: 'admin', fullName: 'Administrador Sistema', role: 'Administrador', module: 'ADMIN', action: 'CREATE', severity: 'INFO', resource: 'Usuario', resourceId: 'u-07', ip: '192.168.1.10', sessionId: 'ses-adm-01', status: 'SUCCESS', details: 'Usuario creado: lsanchez (Laura Sánchez). Rol asignado: Inspector Calidad.' },
  { id: 'aud-029', timestamp: '2026-04-17T09:30:00Z', userId: 'u-01', username: 'admin', fullName: 'Administrador Sistema', role: 'Administrador', module: 'ADMIN', action: 'UPDATE', severity: 'WARNING', resource: 'Rol', resourceId: 'rol-03', before: '{"role":"Operador Producción","permissions":["PROD_VIEW"]}', after: '{"permissions":["PROD_VIEW","PROD_CREATE","INV_VIEW"]}', ip: '192.168.1.10', sessionId: 'ses-adm-01', status: 'SUCCESS', details: 'Rol "Operador Producción" actualizado. Se agregó permiso INV_VIEW.' },
  { id: 'aud-030', timestamp: '2026-04-17T10:00:00Z', userId: 'u-01', username: 'admin', fullName: 'Administrador Sistema', role: 'Administrador', module: 'ADMIN', action: 'UPDATE', severity: 'WARNING', resource: 'Usuario', resourceId: 'u-04', before: '{"status":"ACTIVE"}', after: '{"status":"LOCKED","reason":"Múltiples fallos de login"}', ip: '192.168.1.10', sessionId: 'ses-adm-01', status: 'SUCCESS', details: 'Usuario clopez bloqueado preventivamente tras 5 intentos fallidos consecutivos.' },
  { id: 'aud-031', timestamp: '2026-04-17T11:15:00Z', userId: 'u-01', username: 'admin', fullName: 'Administrador Sistema', role: 'Administrador', module: 'ADMIN', action: 'UPDATE', severity: 'INFO', resource: 'Parámetros del Sistema', resourceId: 'SYS-PARAMS', before: '{"inspection_alert_threshold":3}', after: '{"inspection_alert_threshold":5}', ip: '192.168.1.10', sessionId: 'ses-adm-01', status: 'SUCCESS', details: 'Parámetro inspection_alert_threshold actualizado de 3 a 5.' },

  // REPORTES
  { id: 'aud-032', timestamp: '2026-04-19T11:00:00Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'REPORTES', action: 'EXPORT', severity: 'INFO', resource: 'Reporte Auditoría', resourceId: 'RPT-AUDIT-20260419', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'Exportación CSV de log de auditoría. Rango: 2026-04-01 al 2026-04-19. 87 registros exportados.' },
  { id: 'aud-033', timestamp: '2026-04-19T11:30:00Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'REPORTES', action: 'EXPORT', severity: 'INFO', resource: 'Reporte Calidad', resourceId: 'RPT-QUAL-20260419', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'Exportación reporte de calidad mensual. 12 inspecciones, 3 NC.' },

  // LOGOUT
  { id: 'aud-034', timestamp: '2026-04-19T18:00:00Z', userId: 'u-02', username: 'jperez', fullName: 'Juan Pérez', role: 'Supervisor Producción', module: 'AUTH', action: 'LOGOUT', severity: 'INFO', resource: 'Sesión', resourceId: 'ses-002', ip: '192.168.1.22', sessionId: 'ses-002', status: 'SUCCESS', details: 'Sesión cerrada correctamente.' },
];

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private _entries = new BehaviorSubject<AuditEntry[]>([...SEED].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));

  readonly entries$ = this._entries.asObservable();

  log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
    const newEntry: AuditEntry = {
      ...entry,
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this._entries.next([newEntry, ...this._entries.getValue()]);
  }

  getEntries(): AuditEntry[] {
    return this._entries.getValue();
  }
}
