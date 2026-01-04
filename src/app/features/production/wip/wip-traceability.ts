import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type WipLevel = 'ORDER' | 'LOT' | 'PIECE';
type WipStatus = 'QUEUED' | 'IN_PROGRESS' | 'PAUSED' | 'BLOCKED' | 'COMPLETED' | 'SCRAPPED';
type MachineState = 'RUNNING' | 'STOPPED' | 'FAULT';
type EventType = 'WIP_QUEUED' | 'WIP_STARTED' | 'WIP_PROGRESS_UPDATED' | 'WIP_PAUSED' | 'WIP_RESUMED' | 
                 'WIP_BLOCKED' | 'WIP_COMPLETED' | 'WIP_SCRAPPED' | 'WIP_MOVED' | 
                 'DOWNTIME_STARTED' | 'DOWNTIME_UPDATED' | 'DOWNTIME_ENDED' | 'MACHINE_STATE_CHANGED';

interface WipUnit {
  id: string;
  level: WipLevel;
  assetId: string;
  assetName: string;
  workOrderId?: string;
  lotId?: string;
  pieceId?: string;
  operationId: string;
  operationName: string;
  status: WipStatus;
  goodCount: number;
  scrapCount: number;
  startedAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
}

interface Downtime {
  id: string;
  assetId: string;
  assetName: string;
  wipUnitId?: string;
  reasonCode: string;
  reasonName: string;
  startAt: string;
  endAt?: string;
  trigger: 'AUTO' | 'MANUAL';
  notes?: string;
  duration?: number;
}

interface HistoryEvent {
  id: string;
  type: EventType;
  timestamp: string;
  assetId?: string;
  assetName?: string;
  wipUnitId?: string;
  workOrderId?: string;
  lotId?: string;
  pieceId?: string;
  userId?: string;
  userName?: string;
  payload: any;
  machineState?: MachineState;
  downtimeId?: string;
}

@Component({
  selector: 'app-wip-traceability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wip-traceability.html',
})
export class WipTraceabilityComponent {
  activeTab: 'ACTIVE_WIP' | 'DOWNTIMES' | 'HISTORY' = 'ACTIVE_WIP';

  // WIP activos
  activeWips: WipUnit[] = [
    {
      id: 'wip_001',
      level: 'ORDER',
      assetId: 'M-001',
      assetName: 'Línea Ensamble 1',
      workOrderId: 'OP-1234',
      operationId: 'OP-CUT',
      operationName: 'Corte',
      status: 'IN_PROGRESS',
      goodCount: 485,
      scrapCount: 15,
      startedAt: '2025-12-31 08:00:00',
      updatedAt: '2025-12-31 19:30:00',
      userId: 'op_001',
      userName: 'Juan Pérez'
    },
    {
      id: 'wip_002',
      level: 'LOT',
      assetId: 'M-003',
      assetName: 'Prensa Hidráulica 3',
      workOrderId: 'OP-1235',
      lotId: 'LOT-A-789',
      operationId: 'OP-PRESS',
      operationName: 'Prensado',
      status: 'IN_PROGRESS',
      goodCount: 240,
      scrapCount: 8,
      startedAt: '2025-12-31 12:00:00',
      updatedAt: '2025-12-31 19:28:00',
      userId: 'op_003',
      userName: 'María García'
    },
    {
      id: 'wip_003',
      level: 'PIECE',
      assetId: 'M-005',
      assetName: 'Torno CNC 5',
      workOrderId: 'OP-1237',
      lotId: 'LOT-B-456',
      pieceId: 'PC-0031',
      operationId: 'OP-TURN',
      operationName: 'Torneado',
      status: 'PAUSED',
      goodCount: 1,
      scrapCount: 0,
      startedAt: '2025-12-31 18:00:00',
      updatedAt: '2025-12-31 19:15:00',
      userId: 'op_005',
      userName: 'Carlos López'
    }
  ];

  // Downtimes activos
  activeDowntimes: Downtime[] = [
    {
      id: 'dt_001',
      assetId: 'M-004',
      assetName: 'Soldadora Punto 4',
      wipUnitId: 'wip_004',
      reasonCode: 'MECH_FAULT',
      reasonName: 'Falla Mecánica',
      startAt: '2025-12-31 18:45:00',
      trigger: 'AUTO',
      notes: 'Auto-downtime por detección IoT',
      duration: 45
    },
    {
      id: 'dt_002',
      assetId: 'M-006',
      assetName: 'Empacadora 6',
      reasonCode: 'NO_MATERIAL',
      reasonName: 'Falta de Material',
      startAt: '2025-12-31 19:10:00',
      trigger: 'MANUAL',
      notes: 'Operador reportó falta de MP',
      duration: 20
    }
  ];

  // Historial de eventos
  historyEvents: HistoryEvent[] = [
    { id: 'ev_001', type: 'WIP_STARTED', timestamp: '2025-12-31 08:00:00', assetId: 'M-001', assetName: 'Línea Ensamble 1', wipUnitId: 'wip_001', workOrderId: 'OP-1234', userId: 'op_001', userName: 'Juan Pérez', payload: { operationId: 'OP-CUT' } },
    { id: 'ev_002', type: 'MACHINE_STATE_CHANGED', timestamp: '2025-12-31 10:15:00', assetId: 'M-001', assetName: 'Línea Ensamble 1', machineState: 'STOPPED', payload: { previousState: 'RUNNING' } },
    { id: 'ev_003', type: 'DOWNTIME_STARTED', timestamp: '2025-12-31 10:16:05', assetId: 'M-001', assetName: 'Línea Ensamble 1', wipUnitId: 'wip_001', downtimeId: 'dt_003', payload: { trigger: 'AUTO', reasonCode: 'AUTO_STOP', duration: 65 } },
    { id: 'ev_004', type: 'MACHINE_STATE_CHANGED', timestamp: '2025-12-31 10:25:00', assetId: 'M-001', assetName: 'Línea Ensamble 1', machineState: 'RUNNING', payload: { previousState: 'STOPPED' } },
    { id: 'ev_005', type: 'DOWNTIME_ENDED', timestamp: '2025-12-31 10:25:01', assetId: 'M-001', assetName: 'Línea Ensamble 1', downtimeId: 'dt_003', payload: { duration: 540, reasonCode: 'AUTO_STOP' } },
    { id: 'ev_006', type: 'WIP_PROGRESS_UPDATED', timestamp: '2025-12-31 11:30:00', assetId: 'M-001', assetName: 'Línea Ensamble 1', wipUnitId: 'wip_001', workOrderId: 'OP-1234', userId: 'op_001', userName: 'Juan Pérez', payload: { goodCount: 250, scrapCount: 8 } },
    { id: 'ev_007', type: 'WIP_STARTED', timestamp: '2025-12-31 12:00:00', assetId: 'M-003', assetName: 'Prensa Hidráulica 3', wipUnitId: 'wip_002', workOrderId: 'OP-1235', lotId: 'LOT-A-789', userId: 'op_003', userName: 'María García', payload: { operationId: 'OP-PRESS' } },
    { id: 'ev_008', type: 'WIP_PAUSED', timestamp: '2025-12-31 15:30:00', assetId: 'M-003', assetName: 'Prensa Hidráulica 3', wipUnitId: 'wip_002', userId: 'op_003', userName: 'María García', payload: { pauseType: 'PROCESS', reason: 'Cambio de turno' } },
    { id: 'ev_009', type: 'WIP_RESUMED', timestamp: '2025-12-31 15:45:00', assetId: 'M-003', assetName: 'Prensa Hidráulica 3', wipUnitId: 'wip_002', userId: 'op_004', userName: 'Pedro Sánchez', payload: {} },
    { id: 'ev_010', type: 'WIP_MOVED', timestamp: '2025-12-31 17:00:00', assetId: 'M-003', assetName: 'Prensa Hidráulica 3', wipUnitId: 'wip_002', payload: { fromOperation: 'OP-PRESS', toOperation: 'OP-INSPECT', toAsset: 'M-007' } },
    { id: 'ev_011', type: 'WIP_STARTED', timestamp: '2025-12-31 18:00:00', assetId: 'M-005', assetName: 'Torno CNC 5', wipUnitId: 'wip_003', workOrderId: 'OP-1237', lotId: 'LOT-B-456', pieceId: 'PC-0031', userId: 'op_005', userName: 'Carlos López', payload: { operationId: 'OP-TURN' } },
    { id: 'ev_012', type: 'MACHINE_STATE_CHANGED', timestamp: '2025-12-31 18:45:00', assetId: 'M-004', assetName: 'Soldadora Punto 4', machineState: 'FAULT', payload: { previousState: 'RUNNING', faultCode: 'ERR_002' } },
    { id: 'ev_013', type: 'DOWNTIME_STARTED', timestamp: '2025-12-31 18:46:05', assetId: 'M-004', assetName: 'Soldadora Punto 4', wipUnitId: 'wip_004', downtimeId: 'dt_001', payload: { trigger: 'AUTO', reasonCode: 'MECH_FAULT' } },
    { id: 'ev_014', type: 'WIP_PAUSED', timestamp: '2025-12-31 19:15:00', assetId: 'M-005', assetName: 'Torno CNC 5', wipUnitId: 'wip_003', userId: 'op_005', userName: 'Carlos López', payload: { pauseType: 'PROCESS', reason: 'Verificación dimensional' } },
    { id: 'ev_015', type: 'DOWNTIME_STARTED', timestamp: '2025-12-31 19:10:00', assetId: 'M-006', assetName: 'Empacadora 6', downtimeId: 'dt_002', userId: 'op_006', userName: 'Ana Martínez', payload: { trigger: 'MANUAL', reasonCode: 'NO_MATERIAL' } },
  ];

  // Filtros
  filterAsset: string = 'ALL';
  filterWipLevel: string = 'ALL';
  filterStatus: string = 'ALL';
  filterDowntimeTrigger: string = 'ALL';
  filterEventType: string = 'ALL';
  filterDateFrom: string = '';
  filterDateTo: string = '';
  searchQuery: string = '';

  get filteredWips() {
    return this.activeWips.filter(wip => {
      const matchAsset = this.filterAsset === 'ALL' || wip.assetId === this.filterAsset;
      const matchLevel = this.filterWipLevel === 'ALL' || wip.level === this.filterWipLevel;
      const matchStatus = this.filterStatus === 'ALL' || wip.status === this.filterStatus;
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !this.searchQuery || 
        wip.id.toLowerCase().includes(q) ||
        wip.workOrderId?.toLowerCase().includes(q) ||
        wip.lotId?.toLowerCase().includes(q) ||
        wip.pieceId?.toLowerCase().includes(q) ||
        wip.assetName.toLowerCase().includes(q) ||
        wip.operationName.toLowerCase().includes(q) ||
        wip.userName?.toLowerCase().includes(q);
      return matchAsset && matchLevel && matchStatus && matchSearch;
    });
  }

  get activeDowntimesFiltered() {
    return this.activeDowntimes.filter(dt => {
      const matchAsset = this.filterAsset === 'ALL' || dt.assetId === this.filterAsset;
      const matchTrigger = this.filterDowntimeTrigger === 'ALL' || dt.trigger === this.filterDowntimeTrigger;
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !this.searchQuery ||
        dt.id.toLowerCase().includes(q) ||
        dt.wipUnitId?.toLowerCase().includes(q) ||
        dt.reasonCode.toLowerCase().includes(q) ||
        dt.reasonName.toLowerCase().includes(q) ||
        dt.assetName.toLowerCase().includes(q);
      return matchAsset && matchTrigger && matchSearch;
    });
  }

  get filteredHistory() {
    return this.historyEvents.filter(ev => {
      const matchAsset = this.filterAsset === 'ALL' || ev.assetId === this.filterAsset;
      const matchType = this.filterEventType === 'ALL' || ev.type === this.filterEventType;
      const matchDateFrom = !this.filterDateFrom || ev.timestamp >= this.filterDateFrom;
      const matchDateTo = !this.filterDateTo || ev.timestamp <= this.filterDateTo + ' 23:59:59';
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !this.searchQuery ||
        ev.wipUnitId?.toLowerCase().includes(q) ||
        ev.workOrderId?.toLowerCase().includes(q) ||
        ev.lotId?.toLowerCase().includes(q) ||
        ev.pieceId?.toLowerCase().includes(q) ||
        ev.assetName?.toLowerCase().includes(q) ||
        ev.userName?.toLowerCase().includes(q) ||
        ev.type.toLowerCase().includes(q);
      return matchAsset && matchType && matchDateFrom && matchDateTo && matchSearch;
    });
  }

  get uniqueAssets() {
    const assets = new Set(this.activeWips.map(w => w.assetId));
    return Array.from(assets);
  }

  getStatusClass(status: WipStatus) {
    const map: Record<string, string> = {
      QUEUED: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20',
      IN_PROGRESS: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      PAUSED: 'ui-badge text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
      BLOCKED: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20',
      COMPLETED: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
      SCRAPPED: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20'
    };
    return map[status] || 'ui-badge';
  }

  getEventTypeClass(type: EventType) {
    if (type.startsWith('WIP_')) return 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20';
    if (type.startsWith('DOWNTIME_')) return 'ui-badge text-red-300 bg-red-500/10 border-red-500/20';
    if (type === 'MACHINE_STATE_CHANGED') return 'ui-badge text-purple-300 bg-purple-500/10 border-purple-500/20';
    return 'ui-badge';
  }

  getMachineStateClass(state?: MachineState) {
    const map: Record<string, string> = {
      RUNNING: 'text-green-400',
      STOPPED: 'text-yellow-400',
      FAULT: 'text-red-400'
    };
    return state ? map[state] : '';
  }

  getTriggerClass(trigger: string) {
    return trigger === 'AUTO' 
      ? 'ui-badge text-purple-300 bg-purple-500/10 border-purple-500/20'
      : 'ui-badge text-orange-300 bg-orange-500/10 border-orange-500/20';
  }

  formatDuration(minutes?: number): string {
    if (!minutes) return 'En curso...';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  clearFilters() {
    this.filterAsset = 'ALL';
    this.filterWipLevel = 'ALL';
    this.filterStatus = 'ALL';
    this.filterDowntimeTrigger = 'ALL';
    this.filterEventType = 'ALL';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.searchQuery = '';
  }

  translateWipLevel(level: WipLevel): string {
    const map: Record<WipLevel, string> = {
      'ORDER': 'Orden',
      'LOT': 'Lote',
      'PIECE': 'Pieza'
    };
    return map[level];
  }

  translateWipStatus(status: WipStatus): string {
    const map: Record<WipStatus, string> = {
      'QUEUED': 'En Cola',
      'IN_PROGRESS': 'En Proceso',
      'PAUSED': 'Pausado',
      'BLOCKED': 'Bloqueado',
      'COMPLETED': 'Completado',
      'SCRAPPED': 'Descartado'
    };
    return map[status];
  }

  translateMachineState(state: MachineState): string {
    const map: Record<MachineState, string> = {
      'RUNNING': 'Operando',
      'STOPPED': 'Detenida',
      'FAULT': 'Falla'
    };
    return map[state];
  }

  translateEventType(type: EventType): string {
    const map: Record<EventType, string> = {
      'WIP_QUEUED': 'Unidad en Cola',
      'WIP_STARTED': 'Unidad Iniciada',
      'WIP_PROGRESS_UPDATED': 'Progreso Actualizado',
      'WIP_PAUSED': 'Unidad Pausada',
      'WIP_RESUMED': 'Unidad Reanudada',
      'WIP_BLOCKED': 'Unidad Bloqueada',
      'WIP_COMPLETED': 'Unidad Completada',
      'WIP_SCRAPPED': 'Unidad Descartada',
      'WIP_MOVED': 'Unidad Movida',
      'DOWNTIME_STARTED': 'Parada Iniciada',
      'DOWNTIME_UPDATED': 'Parada Actualizada',
      'DOWNTIME_ENDED': 'Parada Finalizada',
      'MACHINE_STATE_CHANGED': 'Cambio Estado Máquina'
    };
    return map[type];
  }

  translateTrigger(trigger: 'AUTO' | 'MANUAL'): string {
    return trigger === 'AUTO' ? 'Automático' : 'Manual';
  }
}
