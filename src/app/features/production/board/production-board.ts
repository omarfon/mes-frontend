import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type MachineState = 'RUNNING' | 'STOPPED' | 'FAULT' | 'IDLE' | 'MAINTENANCE';

interface AssetStatus {
  assetId: string;
  assetName: string;
  state: MachineState;
  stateStartedAt: string;
  stateElapsedSeconds: number;
  lastSeen: string;
  activeAlarmsCount: number;
  alarms: Alarm[];
}

interface Alarm {
  id: string;
  code: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  startedAt: string;
}

interface ActiveWip {
  wipId: string;
  workOrderId: string;
  lotId?: string;
  pieceId?: string;
  operationId: string;
  operationName: string;
  targetQty: number;
  goodCount: number;
  scrapCount: number;
  startedAt: string;
  elapsedSeconds: number;
  cycleTimeCurrent: number;
  cycleTimeAverage: number;
  efficiency: number;
}

interface ActiveDowntime {
  downtimeId: string;
  reasonCode: string;
  reasonName: string;
  startedAt: string;
  elapsedSeconds: number;
  trigger: 'AUTO' | 'MANUAL';
}

interface TelemetryVariable {
  name: string;
  label: string;
  value: number | string;
  unit: string;
  quality: 'GOOD' | 'STALE' | 'DISCONNECTED';
  lastUpdate: string;
  trend?: number[]; // últimos 15 valores
  min?: number;
  max?: number;
  warning?: { min: number; max: number };
}

interface HistoryEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

@Component({
  selector: 'app-production-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production-board.html',
})
export class ProductionBoardComponent implements OnInit, OnDestroy {
  // Asset seleccionado
  selectedAssetId = 'M-001';
  availableAssets = [
    { id: 'M-001', name: 'Línea Ensamble 1' },
    { id: 'M-002', name: 'Línea Ensamble 2' },
    { id: 'M-003', name: 'Prensa Hidráulica 3' },
    { id: 'M-004', name: 'Soldadora Punto 4' },
    { id: 'M-005', name: 'Torno CNC 5' },
    { id: 'M-006', name: 'Empacadora 6' }
  ];

  // Estado del asset
  assetStatus: AssetStatus = {
    assetId: 'M-001',
    assetName: 'Línea Ensamble 1',
    state: 'RUNNING',
    stateStartedAt: '2025-12-31 08:00:00',
    stateElapsedSeconds: 2400,
    lastSeen: '2025-12-31 08:40:00',
    activeAlarmsCount: 1,
    alarms: [
      { id: 'AL-001', code: 'TEMP_HIGH', description: 'Temperatura elevada en zona 2', severity: 'WARNING', startedAt: '2025-12-31 08:35:00' }
    ]
  };

  // WIP activo
  activeWip: ActiveWip | null = {
    wipId: 'wip_001',
    workOrderId: 'OP-1234',
    lotId: 'LOT-A-456',
    operationId: 'OP-ASSY',
    operationName: 'Ensamble Final',
    targetQty: 500,
    goodCount: 378,
    scrapCount: 12,
    startedAt: '2025-12-31 08:00:00',
    elapsedSeconds: 2400,
    cycleTimeCurrent: 22,
    cycleTimeAverage: 24,
    efficiency: 92
  };

  // Downtime activo
  activeDowntime: ActiveDowntime | null = null;

  // Telemetría
  telemetryVariables: TelemetryVariable[] = [
    { name: 'temperature', label: 'Temperatura', value: 78, unit: '°C', quality: 'GOOD', lastUpdate: '08:39:58', trend: [72, 73, 75, 76, 77, 78, 78, 79, 78, 78, 78, 77, 78, 78, 78], warning: { min: 60, max: 85 } },
    { name: 'pressure', label: 'Presión', value: 4.2, unit: 'bar', quality: 'GOOD', lastUpdate: '08:39:58', trend: [4.0, 4.1, 4.2, 4.2, 4.3, 4.2, 4.1, 4.2, 4.2, 4.2, 4.3, 4.2, 4.2, 4.2, 4.2], warning: { min: 3.5, max: 5.0 } },
    { name: 'rpm', label: 'RPM Motor', value: 1450, unit: 'rpm', quality: 'GOOD', lastUpdate: '08:39:58', trend: [1440, 1445, 1450, 1450, 1455, 1450, 1448, 1450, 1450, 1452, 1450, 1450, 1450, 1450, 1450] },
    { name: 'current', label: 'Corriente', value: 12.3, unit: 'A', quality: 'GOOD', lastUpdate: '08:39:58', trend: [12.0, 12.1, 12.2, 12.3, 12.4, 12.3, 12.2, 12.3, 12.3, 12.3, 12.4, 12.3, 12.3, 12.3, 12.3] },
    { name: 'vibration', label: 'Vibración', value: 0.8, unit: 'mm/s', quality: 'GOOD', lastUpdate: '08:39:57', trend: [0.7, 0.7, 0.8, 0.8, 0.9, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], warning: { min: 0, max: 2.0 } },
    { name: 'counter', label: 'Contador Ciclos', value: 390, unit: 'pcs', quality: 'GOOD', lastUpdate: '08:39:58', trend: [] }
  ];

  // Historial reciente
  recentHistory: HistoryEvent[] = [
    { id: 'ev_015', timestamp: '08:35:12', type: 'ALARM', description: 'Alarma: Temperatura elevada en zona 2', severity: 'WARNING' },
    { id: 'ev_014', timestamp: '08:30:45', type: 'WIP_PROGRESS', description: 'Progreso actualizado: 350 buenas / 10 scrap', severity: 'INFO' },
    { id: 'ev_013', timestamp: '08:15:20', type: 'WIP_PROGRESS', description: 'Progreso actualizado: 300 buenas / 8 scrap', severity: 'INFO' },
    { id: 'ev_012', timestamp: '08:00:00', type: 'WIP_STARTED', description: 'WIP iniciado: OP-1234 / LOT-A-456', severity: 'INFO' },
    { id: 'ev_011', timestamp: '07:55:33', type: 'DOWNTIME_ENDED', description: 'Parada finalizada: Cambio de herramienta (15 min)', severity: 'INFO' },
    { id: 'ev_010', timestamp: '07:40:12', type: 'DOWNTIME_STARTED', description: 'Parada iniciada: Cambio de herramienta', severity: 'WARNING' }
  ];

  // Modal de acciones
  showStartWipModal = false;
  showScrapModal = false;
  showDowntimeModal = false;
  showMaintenanceModal = false;

  // Formularios
  startWipForm = {
    workOrderId: '',
    lotId: '',
    pieceId: '',
    operationId: '',
    targetQty: 0
  };

  scrapForm = {
    quantity: 1,
    reasonCode: '',
    notes: ''
  };

  downtimeForm = {
    reasonCode: '',
    notes: ''
  };

  maintenanceForm = {
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    description: ''
  };

  // Timer para simular actualización en vivo
  private updateInterval: any;

  ngOnInit() {
    // Simular actualización cada 1 segundo
    this.updateInterval = setInterval(() => {
      this.assetStatus.stateElapsedSeconds++;
      if (this.activeWip) {
        this.activeWip.elapsedSeconds++;
      }
      if (this.activeDowntime) {
        this.activeDowntime.elapsedSeconds++;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  onAssetChange() {
    const asset = this.availableAssets.find(a => a.id === this.selectedAssetId);
    if (asset) {
      this.assetStatus.assetId = asset.id;
      this.assetStatus.assetName = asset.name;
      // Aquí normalmente harías un GET para obtener el estado actual
    }
  }

  // ===== Métodos de Acciones =====

  openStartWip() {
    this.showStartWipModal = true;
    this.startWipForm = { workOrderId: '', lotId: '', pieceId: '', operationId: '', targetQty: 0 };
  }

  startWip() {
    console.log('Iniciar WIP:', this.startWipForm);
    // POST /Wip/Start
    this.activeWip = {
      wipId: 'wip_new',
      workOrderId: this.startWipForm.workOrderId,
      lotId: this.startWipForm.lotId,
      pieceId: this.startWipForm.pieceId,
      operationId: this.startWipForm.operationId,
      operationName: 'Operación',
      targetQty: this.startWipForm.targetQty,
      goodCount: 0,
      scrapCount: 0,
      startedAt: new Date().toLocaleString(),
      elapsedSeconds: 0,
      cycleTimeCurrent: 0,
      cycleTimeAverage: 0,
      efficiency: 0
    };
    this.showStartWipModal = false;
  }

  pauseWip() {
    if (!this.activeWip) return;
    console.log('Pausar WIP:', this.activeWip.wipId);
    // PATCH /Wip/:id/Pause
  }

  resumeWip() {
    if (!this.activeWip) return;
    console.log('Reanudar WIP:', this.activeWip.wipId);
    // PATCH /Wip/:id/Resume
  }

  completeWip() {
    if (!this.activeWip) return;
    if (confirm('¿Finalizar la operación actual?')) {
      console.log('Completar WIP:', this.activeWip.wipId);
      // POST /Wip/:id/Complete
      this.activeWip = null;
    }
  }

  openRegisterScrap() {
    this.showScrapModal = true;
    this.scrapForm = { quantity: 1, reasonCode: '', notes: '' };
  }

  registerScrap() {
    console.log('Registrar Scrap:', this.scrapForm);
    // POST /Wip/:id/RegisterScrap
    if (this.activeWip) {
      this.activeWip.scrapCount += this.scrapForm.quantity;
    }
    this.showScrapModal = false;
  }

  openStartDowntime() {
    this.showDowntimeModal = true;
    this.downtimeForm = { reasonCode: '', notes: '' };
  }

  startDowntime() {
    console.log('Iniciar Downtime:', this.downtimeForm);
    // POST /Maintenance/Downtime/Start
    this.activeDowntime = {
      downtimeId: 'dt_new',
      reasonCode: this.downtimeForm.reasonCode,
      reasonName: 'Parada Manual',
      startedAt: new Date().toLocaleString(),
      elapsedSeconds: 0,
      trigger: 'MANUAL'
    };
    this.assetStatus.state = 'STOPPED';
    this.showDowntimeModal = false;
  }

  endDowntime() {
    if (!this.activeDowntime) return;
    if (confirm('¿Cerrar la parada actual?')) {
      console.log('Finalizar Downtime:', this.activeDowntime.downtimeId);
      // POST /Maintenance/Downtime/:id/End
      this.activeDowntime = null;
      this.assetStatus.state = 'RUNNING';
    }
  }

  openCallMaintenance() {
    this.showMaintenanceModal = true;
    this.maintenanceForm = { type: 'PREVENTIVE', priority: 'MEDIUM', description: '' };
  }

  callMaintenance() {
    console.log('Llamar Mantenimiento:', this.maintenanceForm);
    // POST /Maintenance/Interventions
    this.showMaintenanceModal = false;
  }

  // ===== Métodos de visualización =====

  getStateClass(state: MachineState): string {
    const map: Record<MachineState, string> = {
      RUNNING: 'bg-green-500/20 border-green-500 text-green-300',
      STOPPED: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
      FAULT: 'bg-red-500/20 border-red-500 text-red-300',
      IDLE: 'bg-slate-500/20 border-slate-500 text-slate-300',
      MAINTENANCE: 'bg-blue-500/20 border-blue-500 text-blue-300'
    };
    return map[state] || '';
  }

  getStateLabel(state: MachineState): string {
    const map: Record<MachineState, string> = {
      RUNNING: 'Operando',
      STOPPED: 'Detenida',
      FAULT: 'Falla',
      IDLE: 'Inactiva',
      MAINTENANCE: 'Mantenimiento'
    };
    return map[state];
  }

  formatElapsedTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getQualityClass(quality: string): string {
    const map: Record<string, string> = {
      GOOD: 'text-green-400',
      STALE: 'text-yellow-400',
      DISCONNECTED: 'text-red-400'
    };
    return map[quality] || '';
  }

  getQualityIcon(quality: string): string {
    const map: Record<string, string> = {
      GOOD: 'pi-check-circle',
      STALE: 'pi-exclamation-triangle',
      DISCONNECTED: 'pi-times-circle'
    };
    return map[quality] || '';
  }

  isVariableInWarning(variable: TelemetryVariable): boolean {
    if (!variable.warning || typeof variable.value !== 'number') return false;
    return variable.value < variable.warning.min || variable.value > variable.warning.max;
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      INFO: 'text-blue-400',
      WARNING: 'text-yellow-400',
      ERROR: 'text-red-400',
      CRITICAL: 'text-red-500'
    };
    return map[severity] || '';
  }

  getSeverityIcon(severity: string): string {
    const map: Record<string, string> = {
      INFO: 'pi-info-circle',
      WARNING: 'pi-exclamation-triangle',
      ERROR: 'pi-times-circle',
      CRITICAL: 'pi-ban'
    };
    return map[severity] || '';
  }

  getProgressPercentage(): number {
    if (!this.activeWip) return 0;
    return Math.round((this.activeWip.goodCount / this.activeWip.targetQty) * 100);
  }
}
