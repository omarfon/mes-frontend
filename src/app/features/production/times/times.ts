import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OpStatus = 'WAITING' | 'RUNNING' | 'DONE' | 'PAUSED';

interface OperationTime {
  id: string;
  orderCode: string;
  operation: string;      // Hilado, Bobinado...
  machineCode: string;
  shiftCode: string;
  startedAt?: string;     // ISO datetime: 2025-12-22T08:00:00
  endedAt?: string;       // ISO datetime
  status: OpStatus;
  operator?: string;
}

@Component({
  standalone: true,
  selector: 'app-times',
  imports: [CommonModule, FormsModule],
  templateUrl: './times.html',
})
export class TimesComponent {
  // filtros
  qOrder = 'OP-0001';
  machine = 'ALL';
  shift = 'ALL';
  status: 'ALL' | OpStatus = 'ALL';

  // demo data
  items: OperationTime[] = [
    { id: '1', orderCode: 'OP-0001', operation: 'Hilado',   machineCode: 'MC-001', shiftCode: 'A', startedAt: '2025-12-22T07:10:00', endedAt: '2025-12-22T10:05:00', status: 'DONE', operator: 'Juan Pérez' },
    { id: '2', orderCode: 'OP-0001', operation: 'Bobinado', machineCode: 'MC-002', shiftCode: 'A', startedAt: '2025-12-22T10:20:00', endedAt: '', status: 'RUNNING', operator: 'María Torres' },
    { id: '3', orderCode: 'OP-0001', operation: 'Empaque',  machineCode: 'MC-005', shiftCode: 'B', startedAt: '', endedAt: '', status: 'WAITING' },
  ];

  get machines() {
    return Array.from(new Set(this.items.map(x => x.machineCode))).sort();
  }
  get shifts() {
    return Array.from(new Set(this.items.map(x => x.shiftCode))).sort();
  }

  get filtered() {
    return this.items.filter(x => {
      if (this.qOrder && x.orderCode !== this.qOrder) return false;
      if (this.machine !== 'ALL' && x.machineCode !== this.machine) return false;
      if (this.shift !== 'ALL' && x.shiftCode !== this.shift) return false;
      if (this.status !== 'ALL' && x.status !== this.status) return false;
      return true;
    });
  }

  // --- util de tiempo
  private toMs(dt?: string) {
    if (!dt) return null;
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  durationMin(it: OperationTime) {
    const s = this.toMs(it.startedAt);
    if (!s) return 0;
    const e = this.toMs(it.endedAt) ?? Date.now();
    return Math.max(0, Math.round((e - s) / 60000));
  }

  // rango total para pintar barras (min y max)
  get range() {
    const rows = this.filtered.filter(x => x.startedAt);
    if (rows.length === 0) return null;

    const starts = rows.map(x => this.toMs(x.startedAt)!).filter(Boolean);
    const ends = rows.map(x => this.toMs(x.endedAt) ?? Date.now());

    const min = Math.min(...starts);
    const max = Math.max(...ends);

    // padding visual (5 min)
    return { min: min - 5 * 60000, max: max + 5 * 60000 };
  }

  leftPct(it: OperationTime) {
    const r = this.range;
    const s = this.toMs(it.startedAt);
    if (!r || !s) return 0;
    return ((s - r.min) / (r.max - r.min)) * 100;
  }

  widthPct(it: OperationTime) {
    const r = this.range;
    const s = this.toMs(it.startedAt);
    if (!r || !s) return 0;
    const e = this.toMs(it.endedAt) ?? Date.now();
    return Math.max(0.5, ((e - s) / (r.max - r.min)) * 100);
  }

  badge(s: OpStatus) {
    switch (s) {
      case 'RUNNING': return 'ui-badge-warn';
      case 'DONE': return 'ui-badge-ok';
      case 'PAUSED': return 'ui-badge-bad';
      default: return 'ui-badge';
    }
  }

  // formateo hh:mm
  hhmm(dt?: string) {
    if (!dt) return '-';
    const d = new Date(dt);
    if (isNaN(d.getTime())) return '-';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
