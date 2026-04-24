import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type QStatus = 'QUARANTINE' | 'BLOCKED' | 'RELEASED' | 'REJECTED' | 'SCRAPPED';
export type QReason = 'QUALITY_FAIL' | 'SUPPLIER_DEFECT' | 'PROCESS_DEVIATION' | 'CONTAMINATION' | 'EXPIRED' | 'PENDING_ANALYSIS' | 'OTHER';

export interface QuarantineEvent {
  at: string;
  by: string;
  action: string;
  note?: string;
}

export interface QuarantineRecord {
  id: string;
  lotCode: string;
  lotType: 'MP' | 'WIP' | 'PT';
  itemCode: string;
  description: string;
  qty: number;
  uom: string;
  location: string;
  status: QStatus;
  reason: QReason;
  originInspectionId?: string;
  ncapaId?: string;
  enteredAt: string;
  resolvedAt?: string;
  responsibleId: string;
  notes: string;
  events: QuarantineEvent[];
}

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quarantine.html',
})
export class QuarantineComponent {
  q = '';
  statusFilter: 'ALL' | QStatus = 'ALL';
  reasonFilter: 'ALL' | QReason = 'ALL';

  selectedId: string | null = null;
  actionMode: 'release' | 'reject' | 'scrap' | null = null;
  actionNote = '';
  actionQty = 0;

  items: QuarantineRecord[] = [
    {
      id: 'QR-001',
      lotCode: 'LOT-PT-0108',
      lotType: 'PT',
      itemCode: 'PT-HIL-20',
      description: 'Hilo 20/1 Bobinas',
      qty: 300,
      uom: 'kg',
      location: 'ALM-PT/QC',
      status: 'QUARANTINE',
      reason: 'QUALITY_FAIL',
      originInspectionId: 'INS-2026-0041',
      ncapaId: 'NC-2026-0007',
      enteredAt: '2026-04-12T15:00:00Z',
      responsibleId: 'inspector-01',
      notes: 'Resistencia de rotura fuera de especificación. NC abierta.',
      events: [
        { at: '2026-04-12T15:00:00Z', by: 'inspector-01', action: 'BLOQUEADO', note: 'Retención por resultado FAIL en INS-2026-0041' },
        { at: '2026-04-13T09:30:00Z', by: 'calidad-02', action: 'NOTA', note: 'Se envió muestra a laboratorio externo' },
      ],
    },
    {
      id: 'QR-002',
      lotCode: 'LOT-MP-0042',
      lotType: 'MP',
      itemCode: 'MAT-POL-150',
      description: 'Polyester 150D',
      qty: 850,
      uom: 'kg',
      location: 'ALM-01/CU-01',
      status: 'BLOCKED',
      reason: 'SUPPLIER_DEFECT',
      originInspectionId: 'INS-2026-0038',
      enteredAt: '2026-04-10T08:20:00Z',
      responsibleId: 'inspector-02',
      notes: 'Lote de proveedor con contaminación visual detectada en recepción.',
      events: [
        { at: '2026-04-10T08:20:00Z', by: 'inspector-02', action: 'BLOQUEADO', note: 'Contaminación visual en inspección de recepción' },
        { at: '2026-04-11T14:00:00Z', by: 'compras-01', action: 'NOTA', note: 'Proveedor notificado, esperando respuesta en 48h' },
      ],
    },
    {
      id: 'QR-003',
      lotCode: 'LOT-WIP-0088',
      lotType: 'WIP',
      itemCode: 'WIP-TEJ-12',
      description: 'Tela Mezclilla 12oz semiterminada',
      qty: 420,
      uom: 'MT',
      location: 'PLANTA-2/CU-02',
      status: 'QUARANTINE',
      reason: 'PROCESS_DEVIATION',
      enteredAt: '2026-04-15T11:00:00Z',
      responsibleId: 'supervisor-01',
      notes: 'Desviación de gramaje en proceso de tejido. Pendiente análisis de proceso.',
      events: [
        { at: '2026-04-15T11:00:00Z', by: 'supervisor-01', action: 'CUARENTENA', note: 'Gramaje fuera de tolerancia ±5%' },
      ],
    },
    {
      id: 'QR-004',
      lotCode: 'LOT-MP-0039',
      lotType: 'MP',
      itemCode: 'MAT-ALG-PIM',
      description: 'Algodón Pima 24/1',
      qty: 600,
      uom: 'kg',
      location: 'ALM-01/DISP',
      status: 'RELEASED',
      reason: 'PENDING_ANALYSIS',
      originInspectionId: 'INS-2026-0035',
      enteredAt: '2026-04-08T09:00:00Z',
      resolvedAt: '2026-04-09T16:30:00Z',
      responsibleId: 'inspector-01',
      notes: 'Retenido por muestreo de rutina. Liberado tras análisis conforme.',
      events: [
        { at: '2026-04-08T09:00:00Z', by: 'inspector-01', action: 'CUARENTENA', note: 'Muestreo de rutina' },
        { at: '2026-04-09T16:30:00Z', by: 'calidad-01', action: 'LIBERADO', note: 'Análisis de laboratorio OK. Aprobado para uso.' },
      ],
    },
    {
      id: 'QR-005',
      lotCode: 'LOT-PT-0095',
      lotType: 'PT',
      itemCode: 'PT-TELA-BL',
      description: 'Tela Blanca Acabada 150cm',
      qty: 180,
      uom: 'MT',
      location: 'ALM-PT/RECH',
      status: 'REJECTED',
      reason: 'QUALITY_FAIL',
      originInspectionId: 'INS-2026-0029',
      ncapaId: 'NC-2026-0003',
      enteredAt: '2026-04-05T13:00:00Z',
      resolvedAt: '2026-04-07T10:00:00Z',
      responsibleId: 'calidad-01',
      notes: 'Defecto superficial crítico generalizado. NC cerrada. Lote rechazado para reproceso.',
      events: [
        { at: '2026-04-05T13:00:00Z', by: 'inspector-01', action: 'BLOQUEADO', note: 'Defecto manchas críticas > 30% del lote' },
        { at: '2026-04-06T08:00:00Z', by: 'calidad-01', action: 'NOTA', note: 'Revisión 100% en proceso' },
        { at: '2026-04-07T10:00:00Z', by: 'calidad-01', action: 'RECHAZADO', note: 'No apto para despacho. Derivado a reproceso.' },
      ],
    },
  ];

  get filtered(): QuarantineRecord[] {
    const t = this.q.trim().toLowerCase();
    return this.items.filter(r => {
      if (this.statusFilter !== 'ALL' && r.status !== this.statusFilter) return false;
      if (this.reasonFilter !== 'ALL' && r.reason !== this.reasonFilter) return false;
      if (t && ![
        r.lotCode, r.itemCode, r.description, r.responsibleId, r.notes,
        r.originInspectionId ?? '', r.ncapaId ?? ''
      ].join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }

  get selected(): QuarantineRecord | null {
    return this.items.find(r => r.id === this.selectedId) ?? null;
  }

  get pendingCount(): number { return this.items.filter(r => r.status === 'QUARANTINE' || r.status === 'BLOCKED').length; }
  get releasedCount(): number { return this.items.filter(r => r.status === 'RELEASED').length; }
  get rejectedCount(): number { return this.items.filter(r => r.status === 'REJECTED' || r.status === 'SCRAPPED').length; }
  get totalQty(): number { return this.items.filter(r => r.status === 'QUARANTINE' || r.status === 'BLOCKED').reduce((s, r) => s + r.qty, 0); }

  select(r: QuarantineRecord) {
    this.selectedId = this.selectedId === r.id ? null : r.id;
    this.actionMode = null;
    this.actionNote = '';
  }

  openAction(mode: 'release' | 'reject' | 'scrap') {
    this.actionMode = mode;
    this.actionNote = '';
    this.actionQty = this.selected?.qty ?? 0;
  }

  confirmAction() {
    const rec = this.selected;
    if (!rec || !this.actionMode) return;
    const now = new Date().toISOString();
    const byUser = 'calidad-01';
    if (this.actionMode === 'release') {
      rec.status = 'RELEASED';
      rec.resolvedAt = now;
      rec.events.push({ at: now, by: byUser, action: 'LIBERADO', note: this.actionNote });
    } else if (this.actionMode === 'reject') {
      rec.status = 'REJECTED';
      rec.resolvedAt = now;
      rec.events.push({ at: now, by: byUser, action: 'RECHAZADO', note: this.actionNote });
    } else if (this.actionMode === 'scrap') {
      rec.status = 'SCRAPPED';
      rec.resolvedAt = now;
      rec.events.push({ at: now, by: byUser, action: 'DESECHADO', note: this.actionNote });
    }
    this.actionMode = null;
    this.actionNote = '';
  }

  addNote() {
    const rec = this.selected;
    if (!rec || !this.actionNote.trim()) return;
    rec.events.push({ at: new Date().toISOString(), by: 'calidad-01', action: 'NOTA', note: this.actionNote });
    this.actionNote = '';
  }

  statusBadge(s: QStatus): string {
    const m: Record<QStatus, string> = {
      QUARANTINE: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      BLOCKED: 'bg-red-500/10 text-red-400 border border-red-500/30',
      RELEASED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      REJECTED: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      SCRAPPED: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    };
    return m[s] ?? '';
  }

  statusLabel(s: QStatus): string {
    return { QUARANTINE: 'Cuarentena', BLOCKED: 'Bloqueado', RELEASED: 'Liberado', REJECTED: 'Rechazado', SCRAPPED: 'Desechado' }[s] ?? s;
  }

  reasonLabel(r: QReason): string {
    return {
      QUALITY_FAIL: 'Falla de calidad', SUPPLIER_DEFECT: 'Defecto proveedor',
      PROCESS_DEVIATION: 'Desviación de proceso', CONTAMINATION: 'Contaminación',
      EXPIRED: 'Vencido', PENDING_ANALYSIS: 'Análisis pendiente', OTHER: 'Otro',
    }[r] ?? r;
  }

  typeBadge(t: string): string {
    return { MP: 'text-blue-400', WIP: 'text-purple-400', PT: 'text-emerald-400' }[t] ?? 'text-slate-400';
  }

  eventIcon(action: string): string {
    if (action === 'LIBERADO') return 'pi-check-circle text-emerald-400';
    if (action === 'RECHAZADO' || action === 'DESECHADO') return 'pi-times-circle text-red-400';
    if (action === 'BLOQUEADO' || action === 'CUARENTENA') return 'pi-lock text-amber-400';
    return 'pi-comment text-slate-400';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}

