import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'NC_CREATED';

export interface InspectionSummary {
  id: string;
  type: 'INCOMING' | 'IN_PROCESS' | 'FINAL';
  result: 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'PENDING';
  inspector: string;
  date: string;
  quantityInspected: number;
  quantityApproved: number;
  quantityRejected: number;
  defects: { code: string; desc: string; count: number; severity: 'CRITICAL' | 'MAJOR' | 'MINOR' }[];
  observations?: string;
}

export interface QualityDecisionRecord {
  id: string;
  lotCode: string;
  lotType: 'MP' | 'WIP' | 'PT';
  itemCode: string;
  description: string;
  qty: number;
  uom: string;
  location: string;
  status: DecisionStatus;
  inspection: InspectionSummary;
  decisionBy?: string;
  decisionAt?: string;
  decisionNote?: string;
  conditionalQty?: number;
  ncId?: string;
}

@Component({
  selector: 'app-quality-decision',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quality-decision.html',
})
export class QualityDecisionComponent {
  q = '';
  statusFilter: 'ALL' | DecisionStatus = 'PENDING';
  selectedId: string | null = null;
  actionMode: 'approve' | 'reject' | 'conditional' | 'nc' | null = null;
  actionNote = '';
  conditionalQty = 0;

  records: QualityDecisionRecord[] = [
    {
      id: 'qd-001',
      lotCode: 'LOT-MP-0055',
      lotType: 'MP',
      itemCode: 'MAT-NYL-70D',
      description: 'Nylon 70D — Materia Prima',
      qty: 500,
      uom: 'kg',
      location: 'ALM-01/RECV',
      status: 'PENDING',
      inspection: {
        id: 'INS-2026-0047',
        type: 'INCOMING',
        result: 'CONDITIONAL',
        inspector: 'inspector-01',
        date: '2026-04-16T08:00:00Z',
        quantityInspected: 500,
        quantityApproved: 420,
        quantityRejected: 80,
        defects: [
          { code: 'DEF-HUM-001', desc: 'Humedad excesiva en el empaque', count: 3, severity: 'MAJOR' },
          { code: 'DEF-COL-002', desc: 'Variación de color leve en bobinas exteriores', count: 12, severity: 'MINOR' },
        ],
        observations: 'Lote con 80 kg en empaques dañados con posible absorción de humedad. 420 kg restantes conformes.',
      },
    },
    {
      id: 'qd-002',
      lotCode: 'LOT-PT-0110',
      lotType: 'PT',
      itemCode: 'PT-TEL-DEN',
      description: 'Tela Denim 14oz — Producto Terminado',
      qty: 650,
      uom: 'MT',
      location: 'ALM-PT/INS',
      status: 'PENDING',
      inspection: {
        id: 'INS-2026-0048',
        type: 'FINAL',
        result: 'REJECTED',
        inspector: 'inspector-02',
        date: '2026-04-16T10:30:00Z',
        quantityInspected: 650,
        quantityApproved: 310,
        quantityRejected: 340,
        defects: [
          { code: 'DEF-DEN-003', desc: 'Defecto de tramamientos irregulares', count: 87, severity: 'MAJOR' },
          { code: 'DEF-RES-001', desc: 'Resistencia de rotura fuera de rango', count: 12, severity: 'CRITICAL' },
        ],
        observations: 'Más del 50% del lote presenta defectos críticos y mayores. Se recomienda rechazo y análisis de causa raíz.',
      },
    },
    {
      id: 'qd-003',
      lotCode: 'LOT-WIP-0091',
      lotType: 'WIP',
      itemCode: 'WIP-POL-150',
      description: 'Polyester 150D semiterminado — Proceso tintura',
      qty: 280,
      uom: 'kg',
      location: 'PLANTA-1/CT-TIN',
      status: 'PENDING',
      inspection: {
        id: 'INS-2026-0050',
        type: 'IN_PROCESS',
        result: 'CONDITIONAL',
        inspector: 'inspector-01',
        date: '2026-04-17T09:00:00Z',
        quantityInspected: 280,
        quantityApproved: 250,
        quantityRejected: 30,
        defects: [
          { code: 'DEF-COL-003', desc: 'Diferencia de tono (metamerismo)', count: 6, severity: 'MAJOR' },
        ],
        observations: '30 kg con diferencia de tono de lote. Posible continuación con reproceso de igualación.',
      },
    },
    {
      id: 'qd-004',
      lotCode: 'LOT-MP-0052',
      lotType: 'MP',
      itemCode: 'MAT-ALG-COM',
      description: 'Algodón Combed 30/1',
      qty: 1200,
      uom: 'kg',
      location: 'ALM-01/RECV',
      status: 'APPROVED',
      inspection: {
        id: 'INS-2026-0043',
        type: 'INCOMING',
        result: 'APPROVED',
        inspector: 'inspector-02',
        date: '2026-04-14T11:00:00Z',
        quantityInspected: 1200,
        quantityApproved: 1200,
        quantityRejected: 0,
        defects: [],
        observations: 'Lote conforme en todos los parámetros. OK para ingreso a almacén.',
      },
      decisionBy: 'calidad-01',
      decisionAt: '2026-04-14T13:00:00Z',
      decisionNote: 'Lote liberado. Conforme en resistencia, humedad y color según especificación.',
    },
    {
      id: 'qd-005',
      lotCode: 'LOT-PT-0105',
      lotType: 'PT',
      itemCode: 'PT-HIL-CH',
      description: 'Hilo Chenille 100g — Producto Terminado',
      qty: 90,
      uom: 'kg',
      location: 'ALM-PT/RECH',
      status: 'NC_CREATED',
      inspection: {
        id: 'INS-2026-0040',
        type: 'FINAL',
        result: 'REJECTED',
        inspector: 'inspector-01',
        date: '2026-04-12T14:00:00Z',
        quantityInspected: 90,
        quantityApproved: 0,
        quantityRejected: 90,
        defects: [
          { code: 'DEF-RES-001', desc: 'Resistencia de rotura fuera de especificación', count: 18, severity: 'CRITICAL' },
        ],
        observations: 'Lote 100% rechazado. NC creada. Lote en cuarentena QR-001.',
      },
      decisionBy: 'calidad-01',
      decisionAt: '2026-04-12T15:00:00Z',
      decisionNote: 'NC creada: NC-2026-0007. Lote retenido en cuarentena.',
      ncId: 'NC-2026-0007',
    },
  ];

  get filtered(): QualityDecisionRecord[] {
    const t = this.q.trim().toLowerCase();
    return this.records.filter(r => {
      if (this.statusFilter !== 'ALL' && r.status !== this.statusFilter) return false;
      if (t && ![r.lotCode, r.itemCode, r.description, r.inspection.id].join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }

  get selected(): QualityDecisionRecord | null {
    return this.records.find(r => r.id === this.selectedId) ?? null;
  }

  get pendingCount(): number { return this.records.filter(r => r.status === 'PENDING').length; }
  get approvedToday(): number { return this.records.filter(r => r.status === 'APPROVED').length; }
  get rejectedToday(): number { return this.records.filter(r => r.status === 'REJECTED').length; }
  get ncCreatedCount(): number { return this.records.filter(r => r.status === 'NC_CREATED').length; }

  select(r: QualityDecisionRecord) {
    this.selectedId = this.selectedId === r.id ? null : r.id;
    this.actionMode = null;
    this.actionNote = '';
    this.conditionalQty = r.inspection.quantityApproved;
  }

  openAction(mode: 'approve' | 'reject' | 'conditional' | 'nc') {
    this.actionMode = mode;
    this.actionNote = '';
    if (mode === 'conditional') this.conditionalQty = this.selected?.inspection.quantityApproved ?? 0;
  }

  confirmDecision() {
    const rec = this.selected;
    if (!rec || !this.actionMode) return;
    const now = new Date().toISOString();
    rec.decisionBy = 'calidad-01';
    rec.decisionAt = now;
    rec.decisionNote = this.actionNote;
    if (this.actionMode === 'approve') {
      rec.status = 'APPROVED';
    } else if (this.actionMode === 'reject') {
      rec.status = 'REJECTED';
    } else if (this.actionMode === 'conditional') {
      rec.status = 'CONDITIONAL';
      rec.conditionalQty = this.conditionalQty;
    } else if (this.actionMode === 'nc') {
      rec.status = 'NC_CREATED';
      rec.ncId = 'NC-2026-DRAFT';
    }
    this.actionMode = null;
    this.actionNote = '';
  }

  statusBadge(s: DecisionStatus): string {
    return {
      PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      APPROVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      REJECTED: 'bg-red-500/10 text-red-400 border border-red-500/30',
      CONDITIONAL: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      NC_CREATED: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    }[s] ?? '';
  }

  statusLabel(s: DecisionStatus): string {
    return { PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado', CONDITIONAL: 'Condicional', NC_CREATED: 'NC Creada' }[s] ?? s;
  }

  inspResultBadge(r: string): string {
    return {
      APPROVED: 'bg-emerald-500/10 text-emerald-400',
      REJECTED: 'bg-red-500/10 text-red-400',
      CONDITIONAL: 'bg-blue-500/10 text-blue-400',
      PENDING: 'bg-slate-700 text-slate-400',
    }[r] ?? '';
  }

  severityBadge(s: string): string {
    return { CRITICAL: 'bg-red-600/20 text-red-300', MAJOR: 'bg-orange-500/10 text-orange-400', MINOR: 'bg-yellow-500/10 text-yellow-400' }[s] ?? '';
  }

  typeBadge(t: string): string {
    return { MP: 'text-blue-400', WIP: 'text-purple-400', PT: 'text-emerald-400' }[t] ?? 'text-slate-400';
  }

  approvalRate(ins: InspectionSummary): number {
    if (!ins.quantityInspected) return 0;
    return Math.round((ins.quantityApproved / ins.quantityInspected) * 100);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
