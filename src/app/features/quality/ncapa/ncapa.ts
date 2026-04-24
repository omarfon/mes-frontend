import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type NCStatus = 'OPEN' | 'ANALYSIS' | 'ACTION_PLAN' | 'IMPLEMENTATION' | 'VERIFICATION' | 'CLOSED' | 'CANCELLED';
export type NCSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type NCOrigin = 'INSPECTION' | 'CUSTOMER_COMPLAINT' | 'INTERNAL_AUDIT' | 'PROCESS_DEVIATION' | 'SUPPLIER' | 'OTHER';

export interface CAPAAction {
  id: string;
  type: 'CORRECTIVE' | 'PREVENTIVE';
  description: string;
  responsible: string;
  dueDate: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'VERIFIED';
  evidence?: string;
}

export interface NCEvent {
  at: string;
  by: string;
  from: NCStatus;
  to: NCStatus;
  note?: string;
}

export interface NonConformity {
  id: string;
  code: string;
  title: string;
  description: string;
  origin: NCOrigin;
  severity: NCSeverity;
  status: NCStatus;
  lotCode?: string;
  orderId?: string;
  inspectionId?: string;
  productCode?: string;
  defectCodes: string[];
  detectedBy: string;
  detectedAt: string;
  workCenter?: string;
  rootCause?: string;
  rootCauseMethod?: '5WHY' | 'FISHBONE' | 'FMEA' | 'OTHER';
  immediateAction?: string;
  immediateActionBy?: string;
  immediateActionAt?: string;
  actions: CAPAAction[];
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  closedBy?: string;
  closedAt?: string;
  events: NCEvent[];
}

@Component({
  selector: 'app-ncapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ncapa.html',
})
export class NcapaComponent {
  q = '';
  statusFilter: 'ALL' | NCStatus = 'ALL';
  severityFilter: 'ALL' | NCSeverity = 'ALL';

  selectedId: string | null = null;
  activeTab: 'info' | 'analysis' | 'actions' | 'verification' | 'timeline' = 'info';

  // For inline editing
  editingRootCause = false;
  rootCauseText = '';
  rootCauseMethod: '5WHY' | 'FISHBONE' | 'FMEA' | 'OTHER' = '5WHY';
  immediateActionText = '';
  editingImmediateAction = false;

  // New action form
  showActionForm = false;
  newAction: Partial<CAPAAction> = {};

  // Transition
  transitionNote = '';
  showTransition = false;

  // New NC form
  showNewForm = false;
  newNC: Partial<NonConformity> = {};

  submitNewNC() {
    if (!this.newNC.title || !this.newNC.origin || !this.newNC.severity || !this.newNC.description) return;
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const nextNum = String(this.items.length + 1).padStart(4, '0');
    const nc: NonConformity = {
      id: 'nc-new-' + Date.now(),
      code: `NC-${year}-${nextNum}`,
      title: this.newNC.title,
      description: this.newNC.description,
      origin: this.newNC.origin as NCOrigin,
      severity: this.newNC.severity as NCSeverity,
      status: 'OPEN',
      lotCode: this.newNC.lotCode || undefined,
      productCode: this.newNC.productCode || undefined,
      inspectionId: this.newNC.inspectionId || undefined,
      workCenter: this.newNC.workCenter || undefined,
      defectCodes: [],
      detectedBy: 'calidad-01',
      detectedAt: now,
      immediateAction: this.newNC.immediateAction || undefined,
      immediateActionBy: this.newNC.immediateAction ? 'calidad-01' : undefined,
      immediateActionAt: this.newNC.immediateAction ? now : undefined,
      actions: [],
      events: [
        { at: now, by: 'calidad-01', from: 'OPEN', to: 'OPEN', note: 'NC creada' },
      ],
    };
    this.items.unshift(nc);
    this.selectedId = nc.id;
    this.activeTab = 'info';
    this.showNewForm = false;
    this.newNC = {};
  }

  items: NonConformity[] = [
    {
      id: 'nc-001',
      code: 'NC-2026-0007',
      title: 'Resistencia de rotura fuera de especificación — Hilo 20/1',
      description: 'En la inspección final INS-2026-0041 se detectó que la resistencia de rotura del lote LOT-PT-0108 se encuentra 18% por debajo del límite inferior de especificación (35 cN vs mín 45 cN requerido).',
      origin: 'INSPECTION',
      severity: 'MAJOR',
      status: 'ANALYSIS',
      lotCode: 'LOT-PT-0108',
      inspectionId: 'INS-2026-0041',
      productCode: 'PT-HIL-20',
      defectCodes: ['DEF-RES-001'],
      detectedBy: 'inspector-01',
      detectedAt: '2026-04-12T15:00:00Z',
      workCenter: 'CT-CAL',
      immediateAction: 'Lote bloqueado en cuarentena QR-001. Producción en curso retenida hasta investigación.',
      immediateActionBy: 'inspector-01',
      immediateActionAt: '2026-04-12T15:30:00Z',
      rootCause: '1. ¿Por qué baja resistencia? → Tensión de bobinado irregular\n2. ¿Por qué tensión irregular? → Sensor de tensión BOB-003 descalibrado\n3. ¿Por qué descalibrado? → Última calibración hace 6 meses (requería 3 meses)\n4. ¿Por qué sin calibración? → Plan de mantenimiento preventivo no incluyó este equipo\n5. ¿Por qué no incluido? → Error en actualización de plan MP cuando se incorporó la máquina',
      rootCauseMethod: '5WHY',
      actions: [
        {
          id: 'ac-001-a', type: 'CORRECTIVE', description: 'Recalibrar sensor de tensión en BOB-003 y verificar los últimos 3 lotes producidos en esa máquina.',
          responsible: 'mantenimiento-01', dueDate: '2026-04-14', completedAt: '2026-04-13',
          status: 'DONE', evidence: 'Certificado calibración CAL-2026-0144 adjunto.',
        },
        {
          id: 'ac-001-b', type: 'CORRECTIVE', description: 'Revisión y disposición del lote LOT-PT-0108 (300 kg). Análisis de reproceso vs scrap.',
          responsible: 'calidad-01', dueDate: '2026-04-16',
          status: 'IN_PROGRESS',
        },
        {
          id: 'ac-001-c', type: 'PREVENTIVE', description: 'Actualizar plan de mantenimiento preventivo: incluir calibración de sensores de tensión cada 90 días para todas las bobinadoras.',
          responsible: 'jefe-mantenimiento', dueDate: '2026-04-25',
          status: 'PENDING',
        },
        {
          id: 'ac-001-d', type: 'PREVENTIVE', description: 'Crear procedimiento de incorporación de nuevos equipos al plan MP con checklist de sensores críticos.',
          responsible: 'ingenieria-01', dueDate: '2026-04-30',
          status: 'PENDING',
        },
      ],
      events: [
        { at: '2026-04-12T15:00:00Z', by: 'inspector-01', from: 'OPEN', to: 'OPEN', note: 'NC abierta desde inspección INS-2026-0041' },
        { at: '2026-04-13T08:00:00Z', by: 'calidad-01', from: 'OPEN', to: 'ANALYSIS', note: 'Inicio de análisis de causa raíz. Método: 5 WHY' },
      ],
    },
    {
      id: 'nc-002',
      code: 'NC-2026-0003',
      title: 'Defecto superficial crítico generalizado — Tela Blanca Acabada',
      description: 'Lote LOT-PT-0095 (180 MT) presenta manchas superficiales críticas en más del 30% del metraje. Detectado en inspección final de acabados INS-2026-0029.',
      origin: 'INSPECTION',
      severity: 'CRITICAL',
      status: 'CLOSED',
      lotCode: 'LOT-PT-0095',
      inspectionId: 'INS-2026-0029',
      productCode: 'PT-TELA-BL',
      defectCodes: ['DEF-MAN-002', 'DEF-MAN-003'],
      detectedBy: 'inspector-02',
      detectedAt: '2026-04-05T13:00:00Z',
      workCenter: 'CT-ACA',
      immediateAction: 'Lote rechazado. Derivado a reproceso en CT-LAV. Se inspeccionó al 100%.',
      immediateActionBy: 'calidad-01',
      immediateActionAt: '2026-04-05T14:00:00Z',
      rootCause: 'Depósito de aceite de la rama de acabados (ACA-001) contaminó la tela durante proceso de calandrado. La válvula de purga presentó fuga intermitente no detectada en inspección semanal.',
      rootCauseMethod: 'FISHBONE',
      actions: [
        {
          id: 'ac-002-a', type: 'CORRECTIVE', description: 'Reemplazo de válvula de purga en ACA-001.',
          responsible: 'mantenimiento-01', dueDate: '2026-04-06', completedAt: '2026-04-06',
          status: 'VERIFIED', evidence: 'OT-2026-0312 cerrada.',
        },
        {
          id: 'ac-002-b', type: 'CORRECTIVE', description: 'Limpieza profunda de tambores de calandrado y purga completa del sistema.',
          responsible: 'mantenimiento-02', dueDate: '2026-04-06', completedAt: '2026-04-07',
          status: 'VERIFIED', evidence: 'Verificado por supervisor CT-ACA.',
        },
        {
          id: 'ac-002-c', type: 'PREVENTIVE', description: 'Incluir revisión de válvulas de purga en checklist diario antes de inicio de turno.',
          responsible: 'ingenieria-01', dueDate: '2026-04-10', completedAt: '2026-04-09',
          status: 'VERIFIED', evidence: 'Checklist actualizado y aprobado por calidad.',
        },
      ],
      verificationNotes: 'Se produjeron 3 lotes posteriores sin incidencias de contaminación. Acciones verificadas como efectivas.',
      verifiedBy: 'calidad-01',
      verifiedAt: '2026-04-14T10:00:00Z',
      closedBy: 'jefe-calidad',
      closedAt: '2026-04-14T11:00:00Z',
      events: [
        { at: '2026-04-05T13:00:00Z', by: 'inspector-02', from: 'OPEN', to: 'OPEN', note: 'NC abierta' },
        { at: '2026-04-05T15:00:00Z', by: 'calidad-01', from: 'OPEN', to: 'ANALYSIS', note: 'Análisis iniciado. Método Espina de pescado.' },
        { at: '2026-04-06T09:00:00Z', by: 'calidad-01', from: 'ANALYSIS', to: 'ACTION_PLAN', note: 'Causa raíz identificada. Plan CAPA aprobado.' },
        { at: '2026-04-06T10:00:00Z', by: 'mantenimiento-01', from: 'ACTION_PLAN', to: 'IMPLEMENTATION', note: 'Inicio de implementación de acciones.' },
        { at: '2026-04-09T17:00:00Z', by: 'calidad-01', from: 'IMPLEMENTATION', to: 'VERIFICATION', note: 'Acciones implementadas. Inicio período de verificación.' },
        { at: '2026-04-14T11:00:00Z', by: 'jefe-calidad', from: 'VERIFICATION', to: 'CLOSED', note: 'NC cerrada. Acciones verificadas como efectivas.' },
      ],
    },
    {
      id: 'nc-003',
      code: 'NC-2026-0011',
      title: 'Desviación de gramaje en proceso de tejido — Mezclilla 12oz',
      description: 'Lote WIP LOT-WIP-0088 presenta gramaje de 10.8 oz/yd² vs especificación 12±0.5 oz/yd². Detectado durante auto-inspección operador CT-TEJ.',
      origin: 'PROCESS_DEVIATION',
      severity: 'MAJOR',
      status: 'ACTION_PLAN',
      lotCode: 'LOT-WIP-0088',
      productCode: 'WIP-TEJ-12',
      defectCodes: ['DEF-GRM-001'],
      detectedBy: 'supervisor-01',
      detectedAt: '2026-04-15T11:00:00Z',
      workCenter: 'CT-TEJ',
      immediateAction: 'Lote en cuarentena QR-003. Telar TEJ-008 detenido para revisión. Ajuste de parámetros.',
      immediateActionBy: 'supervisor-01',
      immediateActionAt: '2026-04-15T11:30:00Z',
      rootCause: 'Desgaste de peine batidor (diente roto) causa reducción de densidad de trama. El peine no fue inspeccionado en último mantenimiento preventivo.',
      rootCauseMethod: '5WHY',
      actions: [
        {
          id: 'ac-003-a', type: 'CORRECTIVE', description: 'Reemplazar peine batidor TEJ-008. Inspección completa del equipo.',
          responsible: 'mantenimiento-01', dueDate: '2026-04-17',
          status: 'IN_PROGRESS',
        },
        {
          id: 'ac-003-b', type: 'CORRECTIVE', description: 'Evaluar reproceso del lote LOT-WIP-0088: Re-tejido del metraje afectado o scrap parcial.',
          responsible: 'calidad-01', dueDate: '2026-04-18',
          status: 'PENDING',
        },
        {
          id: 'ac-003-c', type: 'PREVENTIVE', description: 'Incorporar inspección visual de peines batidores en checklist de mantenimiento preventivo semanal.',
          responsible: 'jefe-mantenimiento', dueDate: '2026-04-22',
          status: 'PENDING',
        },
      ],
      events: [
        { at: '2026-04-15T11:00:00Z', by: 'supervisor-01', from: 'OPEN', to: 'OPEN', note: 'NC abierta por desviación detectada' },
        { at: '2026-04-15T14:00:00Z', by: 'calidad-01', from: 'OPEN', to: 'ANALYSIS', note: 'Inicio análisis 5 WHY' },
        { at: '2026-04-16T09:00:00Z', by: 'calidad-01', from: 'ANALYSIS', to: 'ACTION_PLAN', note: 'Plan CAPA definido y aprobado por jefe de calidad' },
      ],
    },
  ];

  get filtered(): NonConformity[] {
    const t = this.q.trim().toLowerCase();
    return this.items.filter(nc => {
      if (this.statusFilter !== 'ALL' && nc.status !== this.statusFilter) return false;
      if (this.severityFilter !== 'ALL' && nc.severity !== this.severityFilter) return false;
      if (t && ![nc.code, nc.title, nc.lotCode ?? '', nc.productCode ?? '', nc.inspectionId ?? '', nc.detectedBy].join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }

  get selected(): NonConformity | null {
    return this.items.find(nc => nc.id === this.selectedId) ?? null;
  }

  get openCount(): number { return this.items.filter(nc => nc.status !== 'CLOSED' && nc.status !== 'CANCELLED').length; }
  get criticalCount(): number { return this.items.filter(nc => nc.severity === 'CRITICAL' && nc.status !== 'CLOSED').length; }
  get closedCount(): number { return this.items.filter(nc => nc.status === 'CLOSED').length; }
  get overdueActions(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.items.flatMap(nc => nc.actions).filter(a => a.dueDate < today && a.status !== 'DONE' && a.status !== 'VERIFIED').length;
  }

  select(nc: NonConformity) {
    this.selectedId = this.selectedId === nc.id ? null : nc.id;
    this.activeTab = 'info';
    this.showActionForm = false;
    this.editingRootCause = false;
    this.editingImmediateAction = false;
    this.showTransition = false;
  }

  statusFlow: Record<NCStatus, NCStatus | null> = {
    OPEN: 'ANALYSIS',
    ANALYSIS: 'ACTION_PLAN',
    ACTION_PLAN: 'IMPLEMENTATION',
    IMPLEMENTATION: 'VERIFICATION',
    VERIFICATION: 'CLOSED',
    CLOSED: null,
    CANCELLED: null,
  };

  nextStatus(s: NCStatus): NCStatus | null { return this.statusFlow[s]; }

  advance() {
    const nc = this.selected;
    if (!nc) return;
    const next = this.nextStatus(nc.status);
    if (!next) return;
    const now = new Date().toISOString();
    nc.events.push({ at: now, by: 'calidad-01', from: nc.status, to: next, note: this.transitionNote || undefined });
    if (next === 'CLOSED') { nc.closedBy = 'calidad-01'; nc.closedAt = now; }
    nc.status = next;
    this.transitionNote = '';
    this.showTransition = false;
  }

  saveRootCause() {
    const nc = this.selected;
    if (!nc) return;
    nc.rootCause = this.rootCauseText;
    nc.rootCauseMethod = this.rootCauseMethod;
    this.editingRootCause = false;
  }

  startEditRootCause() {
    const nc = this.selected;
    if (!nc) return;
    this.rootCauseText = nc.rootCause ?? '';
    this.rootCauseMethod = nc.rootCauseMethod ?? '5WHY';
    this.editingRootCause = true;
  }

  saveImmediateAction() {
    const nc = this.selected;
    if (!nc) return;
    nc.immediateAction = this.immediateActionText;
    nc.immediateActionBy = 'calidad-01';
    nc.immediateActionAt = new Date().toISOString();
    this.editingImmediateAction = false;
  }

  addAction() {
    const nc = this.selected;
    if (!nc || !this.newAction.description) return;
    nc.actions.push({
      id: 'ac-new-' + Date.now(),
      type: this.newAction.type ?? 'CORRECTIVE',
      description: this.newAction.description,
      responsible: this.newAction.responsible ?? '',
      dueDate: this.newAction.dueDate ?? '',
      status: 'PENDING',
    });
    this.newAction = {};
    this.showActionForm = false;
  }

  updateActionStatus(nc: NonConformity, action: CAPAAction, status: CAPAAction['status']) {
    action.status = status;
    if (status === 'DONE' || status === 'VERIFIED') {
      action.completedAt = new Date().toISOString().slice(0, 10);
    }
  }

  statusBadge(s: NCStatus): string {
    const m: Record<NCStatus, string> = {
      OPEN: 'bg-red-500/10 text-red-400 border border-red-500/30',
      ANALYSIS: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      ACTION_PLAN: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      IMPLEMENTATION: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      VERIFICATION: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      CLOSED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      CANCELLED: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    };
    return m[s] ?? '';
  }

  statusLabel(s: NCStatus): string {
    return {
      OPEN: 'Abierta', ANALYSIS: 'Análisis', ACTION_PLAN: 'Plan CAPA',
      IMPLEMENTATION: 'Implementación', VERIFICATION: 'Verificación',
      CLOSED: 'Cerrada', CANCELLED: 'Cancelada',
    }[s] ?? s;
  }

  nextStatusLabel(s: NCStatus): string {
    const m: Record<NCStatus, string> = {
      OPEN: 'Iniciar análisis',
      ANALYSIS: 'Definir plan CAPA',
      ACTION_PLAN: 'Iniciar implementación',
      IMPLEMENTATION: 'Pasar a verificación',
      VERIFICATION: 'Cerrar NC',
      CLOSED: '',
      CANCELLED: '',
    };
    return m[s] ?? '';
  }

  severityBadge(s: NCSeverity): string {
    return {
      CRITICAL: 'bg-red-600/20 text-red-300 border border-red-600/40',
      MAJOR: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      MINOR: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
    }[s] ?? '';
  }

  actionStatusBadge(s: CAPAAction['status']): string {
    return {
      PENDING: 'bg-slate-700 text-slate-400',
      IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
      DONE: 'bg-amber-500/10 text-amber-400',
      VERIFIED: 'bg-emerald-500/10 text-emerald-400',
    }[s] ?? '';
  }

  actionTypeBadge(t: CAPAAction['type']): string {
    return t === 'CORRECTIVE'
      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  }

  originLabel(o: NCOrigin): string {
    return {
      INSPECTION: 'Inspección', CUSTOMER_COMPLAINT: 'Queja cliente',
      INTERNAL_AUDIT: 'Auditoría interna', PROCESS_DEVIATION: 'Desviación proceso',
      SUPPLIER: 'Proveedor', OTHER: 'Otro',
    }[o] ?? o;
  }

  setTab(tab: string) {
    this.activeTab = tab as any;
  }

  isOverdue(action: CAPAAction): boolean {
    return action.dueDate < new Date().toISOString().slice(0, 10) && action.status !== 'DONE' && action.status !== 'VERIFIED';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
