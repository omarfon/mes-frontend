import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type OPQualityResult = 'PENDING' | 'APPROVED' | 'CONDITIONAL' | 'REJECTED';
export type OPStatus = 'IN_PROCESS' | 'COMPLETED' | 'ON_HOLD' | 'CLOSED';

export interface OPInspection {
  id: string;
  code: string;
  type: 'INCOMING' | 'IN_PROCESS' | 'FINAL';
  workCenter: string;
  processName: string;
  result: 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'PENDING';
  inspector: string;
  date: string;
  quantityInspected: number;
  quantityApproved: number;
  quantityRejected: number;
  defects: { code: string; desc: string; count: number; severity: 'CRITICAL' | 'MAJOR' | 'MINOR' }[];
  ncId?: string;
  observations?: string;
}

export interface OPNCSummary {
  id: string;
  code: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: string;
  inspectionId?: string;
}

export interface OPProcessNode {
  seq: number;
  workCenter: string;
  processName: string;
  inspected: boolean;
  result: 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'PENDING' | 'NOT_INSPECTED';
}

export interface OPReview {
  id: string;
  orderCode: string;
  productCode: string;
  productName: string;
  qty: number;
  uom: string;
  startedAt: string;
  completedAt?: string;
  opStatus: OPStatus;
  qualityResult: OPQualityResult;
  processFlow: OPProcessNode[];
  inspections: OPInspection[];
  ncs: OPNCSummary[];
}

@Component({
  selector: 'app-op-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './op-review.html',
})
export class OpReviewComponent {
  q = '';
  resultFilter: 'ALL' | OPQualityResult = 'ALL';
  statusFilter: 'ALL' | OPStatus = 'ALL';
  selectedId: string | null = null;
  activeTab: 'process' | 'inspections' | 'ncs' = 'process';

  orders: OPReview[] = [
    {
      id: 'op-001',
      orderCode: 'OP-2026-0342',
      productCode: 'PT-HIL-20',
      productName: 'Hilo 20/1 Poliéster Bobinas',
      qty: 500,
      uom: 'kg',
      startedAt: '2026-04-08T06:00:00Z',
      completedAt: '2026-04-12T18:00:00Z',
      opStatus: 'COMPLETED',
      qualityResult: 'REJECTED',
      processFlow: [
        { seq: 1, workCenter: 'CT-PREP', processName: 'Preparación hilado', inspected: true, result: 'APPROVED' },
        { seq: 2, workCenter: 'CT-HIL', processName: 'Hilatura', inspected: true, result: 'APPROVED' },
        { seq: 3, workCenter: 'CT-BOB', processName: 'Bobinado', inspected: true, result: 'CONDITIONAL' },
        { seq: 4, workCenter: 'CT-CAL', processName: 'Control final', inspected: true, result: 'REJECTED' },
      ],
      inspections: [
        {
          id: 'ins-op001-a', code: 'INS-2026-0038', type: 'INCOMING', workCenter: 'CT-PREP',
          processName: 'Preparación hilado', result: 'APPROVED', inspector: 'inspector-02',
          date: '2026-04-08T08:00:00Z', quantityInspected: 500, quantityApproved: 500, quantityRejected: 0,
          defects: [], observations: 'MP conforme en todos los parámetros.',
        },
        {
          id: 'ins-op001-b', code: 'INS-2026-0039', type: 'IN_PROCESS', workCenter: 'CT-HIL',
          processName: 'Hilatura', result: 'APPROVED', inspector: 'inspector-01',
          date: '2026-04-10T10:00:00Z', quantityInspected: 480, quantityApproved: 480, quantityRejected: 0,
          defects: [], observations: 'Proceso estable. Título Nm dentro de tolerancia.',
        },
        {
          id: 'ins-op001-c', code: 'INS-2026-0040', type: 'IN_PROCESS', workCenter: 'CT-BOB',
          processName: 'Bobinado', result: 'CONDITIONAL', inspector: 'inspector-01',
          date: '2026-04-11T14:00:00Z', quantityInspected: 480, quantityApproved: 450, quantityRejected: 30,
          defects: [
            { code: 'DEF-TEN-001', desc: 'Tensión de bobinado irregular', count: 8, severity: 'MAJOR' },
          ],
          observations: '30 kg con bobinas de tensión irregular. Posible descalibración sensor BOB-003.',
        },
        {
          id: 'ins-op001-d', code: 'INS-2026-0041', type: 'FINAL', workCenter: 'CT-CAL',
          processName: 'Control final', result: 'REJECTED', inspector: 'inspector-01',
          date: '2026-04-12T15:00:00Z', quantityInspected: 300, quantityApproved: 0, quantityRejected: 300,
          defects: [
            { code: 'DEF-RES-001', desc: 'Resistencia de rotura fuera de especificación', count: 18, severity: 'CRITICAL' },
          ],
          ncId: 'NC-2026-0007',
          observations: 'Lote rechazado. Resistencia 35 cN vs mín 45 cN. NC abierta.',
        },
      ],
      ncs: [
        {
          id: 'nc-001', code: 'NC-2026-0007',
          title: 'Resistencia de rotura fuera de especificación — Hilo 20/1',
          severity: 'MAJOR', status: 'ANALYSIS', inspectionId: 'INS-2026-0041',
        },
      ],
    },
    {
      id: 'op-002',
      orderCode: 'OP-2026-0338',
      productCode: 'PT-TELA-BL',
      productName: 'Tela Blanca Acabada 150cm',
      qty: 800,
      uom: 'MT',
      startedAt: '2026-04-01T06:00:00Z',
      completedAt: '2026-04-07T18:00:00Z',
      opStatus: 'CLOSED',
      qualityResult: 'CONDITIONAL',
      processFlow: [
        { seq: 1, workCenter: 'CT-TEJ', processName: 'Tejido', inspected: true, result: 'APPROVED' },
        { seq: 2, workCenter: 'CT-TIN', processName: 'Tintura', inspected: true, result: 'APPROVED' },
        { seq: 3, workCenter: 'CT-ACA', processName: 'Acabados', inspected: true, result: 'REJECTED' },
        { seq: 4, workCenter: 'CT-CAL', processName: 'Control final', inspected: true, result: 'CONDITIONAL' },
      ],
      inspections: [
        {
          id: 'ins-op002-a', code: 'INS-2026-0025', type: 'IN_PROCESS', workCenter: 'CT-TEJ',
          processName: 'Tejido', result: 'APPROVED', inspector: 'inspector-01',
          date: '2026-04-02T09:00:00Z', quantityInspected: 800, quantityApproved: 800, quantityRejected: 0,
          defects: [], observations: 'Gramaje 150±2 g/m². OK.',
        },
        {
          id: 'ins-op002-b', code: 'INS-2026-0027', type: 'IN_PROCESS', workCenter: 'CT-TIN',
          processName: 'Tintura', result: 'APPROVED', inspector: 'inspector-02',
          date: '2026-04-04T11:00:00Z', quantityInspected: 800, quantityApproved: 790, quantityRejected: 10,
          defects: [
            { code: 'DEF-COL-001', desc: 'Variación tono leve borde', count: 2, severity: 'MINOR' },
          ],
          observations: '10 MT con variación de tono menor en borde. Aceptado.',
        },
        {
          id: 'ins-op002-c', code: 'INS-2026-0028', type: 'IN_PROCESS', workCenter: 'CT-ACA',
          processName: 'Acabados', result: 'REJECTED', inspector: 'inspector-02',
          date: '2026-04-05T13:00:00Z', quantityInspected: 800, quantityApproved: 620, quantityRejected: 180,
          defects: [
            { code: 'DEF-MAN-002', desc: 'Mancha aceite superficial', count: 54, severity: 'CRITICAL' },
            { code: 'DEF-MAN-003', desc: 'Mancha aceite profunda', count: 12, severity: 'CRITICAL' },
          ],
          ncId: 'NC-2026-0003',
          observations: '180 MT con contaminación de aceite de rama. NC abierta.',
        },
        {
          id: 'ins-op002-d', code: 'INS-2026-0029', type: 'FINAL', workCenter: 'CT-CAL',
          processName: 'Control final', result: 'CONDITIONAL', inspector: 'inspector-01',
          date: '2026-04-07T10:00:00Z', quantityInspected: 620, quantityApproved: 620, quantityRejected: 0,
          defects: [],
          observations: '620 MT aprobados. 180 MT derivados a reproceso. NC-2026-0003 cerrada.',
        },
      ],
      ncs: [
        {
          id: 'nc-002', code: 'NC-2026-0003',
          title: 'Defecto superficial crítico generalizado — Tela Blanca',
          severity: 'CRITICAL', status: 'CLOSED', inspectionId: 'INS-2026-0028',
        },
      ],
    },
    {
      id: 'op-003',
      orderCode: 'OP-2026-0345',
      productCode: 'WIP-TEJ-12',
      productName: 'Tela Mezclilla 12oz',
      qty: 600,
      uom: 'MT',
      startedAt: '2026-04-14T06:00:00Z',
      opStatus: 'ON_HOLD',
      qualityResult: 'CONDITIONAL',
      processFlow: [
        { seq: 1, workCenter: 'CT-PREP', processName: 'Preparación', inspected: true, result: 'APPROVED' },
        { seq: 2, workCenter: 'CT-TEJ', processName: 'Tejido', inspected: true, result: 'CONDITIONAL' },
        { seq: 3, workCenter: 'CT-TIN', processName: 'Tintura', inspected: false, result: 'NOT_INSPECTED' },
        { seq: 4, workCenter: 'CT-ACA', processName: 'Acabados', inspected: false, result: 'NOT_INSPECTED' },
        { seq: 5, workCenter: 'CT-CAL', processName: 'Control final', inspected: false, result: 'NOT_INSPECTED' },
      ],
      inspections: [
        {
          id: 'ins-op003-a', code: 'INS-2026-0044', type: 'IN_PROCESS', workCenter: 'CT-PREP',
          processName: 'Preparación', result: 'APPROVED', inspector: 'inspector-01',
          date: '2026-04-14T09:00:00Z', quantityInspected: 600, quantityApproved: 600, quantityRejected: 0,
          defects: [], observations: 'Hilos conformes.',
        },
        {
          id: 'ins-op003-b', code: 'INS-2026-0050', type: 'IN_PROCESS', workCenter: 'CT-TEJ',
          processName: 'Tejido', result: 'CONDITIONAL', inspector: 'supervisor-01',
          date: '2026-04-15T11:00:00Z', quantityInspected: 420, quantityApproved: 390, quantityRejected: 30,
          defects: [
            { code: 'DEF-GRM-001', desc: 'Gramaje fuera de tolerancia', count: 6, severity: 'MAJOR' },
          ],
          ncId: 'NC-2026-0011',
          observations: 'OP en espera. Telar detenido para reparación. NC abierta.',
        },
      ],
      ncs: [
        {
          id: 'nc-003', code: 'NC-2026-0011',
          title: 'Desviación de gramaje en tejido — Mezclilla 12oz',
          severity: 'MAJOR', status: 'ACTION_PLAN', inspectionId: 'INS-2026-0050',
        },
      ],
    },
    {
      id: 'op-004',
      orderCode: 'OP-2026-0333',
      productCode: 'PT-NYL-70',
      productName: 'Hilo Nylon 70D Cono',
      qty: 300,
      uom: 'kg',
      startedAt: '2026-03-28T06:00:00Z',
      completedAt: '2026-04-03T17:00:00Z',
      opStatus: 'CLOSED',
      qualityResult: 'APPROVED',
      processFlow: [
        { seq: 1, workCenter: 'CT-PREP', processName: 'Preparación', inspected: true, result: 'APPROVED' },
        { seq: 2, workCenter: 'CT-HIL', processName: 'Hilatura', inspected: true, result: 'APPROVED' },
        { seq: 3, workCenter: 'CT-BOB', processName: 'Bobinado', inspected: true, result: 'APPROVED' },
        { seq: 4, workCenter: 'CT-CAL', processName: 'Control final', inspected: true, result: 'APPROVED' },
      ],
      inspections: [
        {
          id: 'ins-op004-a', code: 'INS-2026-0020', type: 'INCOMING', workCenter: 'CT-PREP',
          processName: 'Preparación', result: 'APPROVED', inspector: 'inspector-02',
          date: '2026-03-28T08:00:00Z', quantityInspected: 300, quantityApproved: 300, quantityRejected: 0,
          defects: [],
        },
        {
          id: 'ins-op004-b', code: 'INS-2026-0022', type: 'IN_PROCESS', workCenter: 'CT-HIL',
          processName: 'Hilatura', result: 'APPROVED', inspector: 'inspector-01',
          date: '2026-03-30T10:00:00Z', quantityInspected: 295, quantityApproved: 295, quantityRejected: 0,
          defects: [],
        },
        {
          id: 'ins-op004-c', code: 'INS-2026-0024', type: 'IN_PROCESS', workCenter: 'CT-BOB',
          processName: 'Bobinado', result: 'APPROVED', inspector: 'inspector-01',
          date: '2026-04-01T14:00:00Z', quantityInspected: 290, quantityApproved: 288, quantityRejected: 2,
          defects: [
            { code: 'DEF-CON-001', desc: 'Cono con empaque defectuoso', count: 2, severity: 'MINOR' },
          ],
          observations: '2 conos reempacados in situ. OK.',
        },
        {
          id: 'ins-op004-d', code: 'INS-2026-0026', type: 'FINAL', workCenter: 'CT-CAL',
          processName: 'Control final', result: 'APPROVED', inspector: 'inspector-02',
          date: '2026-04-03T15:00:00Z', quantityInspected: 290, quantityApproved: 290, quantityRejected: 0,
          defects: [], observations: 'Lote aprobado para despacho.',
        },
      ],
      ncs: [],
    },
    {
      id: 'op-005',
      orderCode: 'OP-2026-0347',
      productCode: 'PT-ALG-CH',
      productName: 'Hilo Algodón Combed 30/1',
      qty: 1200,
      uom: 'kg',
      startedAt: '2026-04-16T06:00:00Z',
      opStatus: 'IN_PROCESS',
      qualityResult: 'PENDING',
      processFlow: [
        { seq: 1, workCenter: 'CT-PREP', processName: 'Preparación', inspected: true, result: 'APPROVED' },
        { seq: 2, workCenter: 'CT-CAR', processName: 'Cardado', inspected: true, result: 'APPROVED' },
        { seq: 3, workCenter: 'CT-HIL', processName: 'Hilatura', inspected: false, result: 'NOT_INSPECTED' },
        { seq: 4, workCenter: 'CT-BOB', processName: 'Bobinado', inspected: false, result: 'NOT_INSPECTED' },
        { seq: 5, workCenter: 'CT-CAL', processName: 'Control final', inspected: false, result: 'NOT_INSPECTED' },
      ],
      inspections: [
        {
          id: 'ins-op005-a', code: 'INS-2026-0052', type: 'INCOMING', workCenter: 'CT-PREP',
          processName: 'Preparación', result: 'APPROVED', inspector: 'inspector-01',
          date: '2026-04-16T08:00:00Z', quantityInspected: 1200, quantityApproved: 1200, quantityRejected: 0,
          defects: [], observations: 'MP Algodón Combed conforme.',
        },
        {
          id: 'ins-op005-b', code: 'INS-2026-0053', type: 'IN_PROCESS', workCenter: 'CT-CAR',
          processName: 'Cardado', result: 'APPROVED', inspector: 'inspector-02',
          date: '2026-04-17T10:00:00Z', quantityInspected: 1150, quantityApproved: 1150, quantityRejected: 0,
          defects: [], observations: 'Neps dentro de rango. OK.',
        },
      ],
      ncs: [],
    },
  ];

  get filtered(): OPReview[] {
    const t = this.q.trim().toLowerCase();
    return this.orders.filter(op => {
      if (this.resultFilter !== 'ALL' && op.qualityResult !== this.resultFilter) return false;
      if (this.statusFilter !== 'ALL' && op.opStatus !== this.statusFilter) return false;
      if (t && ![op.orderCode, op.productCode, op.productName].join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }

  get selected(): OPReview | null {
    return this.orders.find(op => op.id === this.selectedId) ?? null;
  }

  get totalOPs(): number { return this.orders.length; }
  get approvedOPs(): number { return this.orders.filter(op => op.qualityResult === 'APPROVED').length; }
  get rejectedOPs(): number { return this.orders.filter(op => op.qualityResult === 'REJECTED').length; }
  get openNCs(): number { return this.orders.flatMap(op => op.ncs).filter(nc => nc.status !== 'CLOSED' && nc.status !== 'CANCELLED').length; }

  select(op: OPReview) {
    this.selectedId = this.selectedId === op.id ? null : op.id;
    this.activeTab = 'process';
  }

  setActiveTab(tab: string) {
    this.activeTab = tab as 'process' | 'inspections' | 'ncs';
  }

  qualityResultBadge(r: OPQualityResult): string {
    return {
      PENDING: 'bg-slate-700 text-slate-400',
      APPROVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      CONDITIONAL: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      REJECTED: 'bg-red-500/10 text-red-400 border border-red-500/30',
    }[r] ?? '';
  }

  qualityResultLabel(r: OPQualityResult): string {
    return { PENDING: 'Pendiente', APPROVED: 'Aprobada', CONDITIONAL: 'Condicional', REJECTED: 'Rechazada' }[r] ?? r;
  }

  opStatusBadge(s: OPStatus): string {
    return {
      IN_PROCESS: 'bg-amber-500/10 text-amber-400',
      COMPLETED: 'bg-purple-500/10 text-purple-400',
      ON_HOLD: 'bg-orange-500/10 text-orange-400',
      CLOSED: 'bg-slate-700 text-slate-400',
    }[s] ?? '';
  }

  opStatusLabel(s: OPStatus): string {
    return { IN_PROCESS: 'En proceso', COMPLETED: 'Completada', ON_HOLD: 'En espera', CLOSED: 'Cerrada' }[s] ?? s;
  }

  nodeClass(result: OPProcessNode['result']): string {
    return {
      APPROVED: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
      REJECTED: 'bg-red-500/15 border-red-500/50 text-red-400',
      CONDITIONAL: 'bg-blue-500/15 border-blue-500/50 text-blue-400',
      PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      NOT_INSPECTED: 'bg-slate-800 border-slate-700 text-slate-500',
    }[result] ?? '';
  }

  nodeIcon(result: OPProcessNode['result']): string {
    return {
      APPROVED: 'pi-check text-emerald-400',
      REJECTED: 'pi-times text-red-400',
      CONDITIONAL: 'pi-minus text-blue-400',
      PENDING: 'pi-clock text-amber-400',
      NOT_INSPECTED: 'pi-circle text-slate-600',
    }[result] ?? '';
  }

  connectorClass(result: OPProcessNode['result']): string {
    return result === 'APPROVED' ? 'bg-emerald-500/30' : result === 'NOT_INSPECTED' ? 'bg-slate-800' : 'bg-slate-700';
  }

  inspResultBadge(r: string): string {
    return {
      APPROVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border border-red-500/20',
      CONDITIONAL: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      PENDING: 'bg-slate-700 text-slate-400',
    }[r] ?? '';
  }

  ncSeverityBadge(s: string): string {
    return {
      CRITICAL: 'bg-red-600/20 text-red-300 border border-red-600/30',
      MAJOR: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      MINOR: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    }[s] ?? '';
  }

  ncStatusBadge(s: string): string {
    const m: Record<string, string> = {
      OPEN: 'text-red-400', ANALYSIS: 'text-purple-400', ACTION_PLAN: 'text-blue-400',
      IMPLEMENTATION: 'text-amber-400', VERIFICATION: 'text-cyan-400',
      CLOSED: 'text-emerald-400', CANCELLED: 'text-slate-500',
    };
    return m[s] ?? 'text-slate-400';
  }

  approvalRate(ins: OPInspection): number {
    if (!ins.quantityInspected) return 0;
    return Math.round((ins.quantityApproved / ins.quantityInspected) * 100);
  }

  inspectionCount(op: OPReview): number { return op.inspections.length; }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatDateShort(d: string): string {
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
