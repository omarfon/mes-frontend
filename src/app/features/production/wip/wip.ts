import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type WipStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

interface WipRecord {
  id: string;
  orderCode: string;
  operation: string;     // proceso/operación
  machineCode: string;
  plannedQty: number;
  doneQty: number;
  uom: string;
  status: WipStatus;
  updatedAt: string;     // YYYY-MM-DD
}

@Component({
  standalone: true,
  selector: 'app-wip',
  imports: [CommonModule, FormsModule],
  templateUrl: './wip.html',
})
export class WipComponent {
  q = '';
  editingId: string | null = null;

  form: Omit<WipRecord, 'id'> = {
    orderCode: '',
    operation: '',
    machineCode: '',
    plannedQty: 0,
    doneQty: 0,
    uom: 'kg',
    status: 'WAITING',
    updatedAt: '',
  };

  items: WipRecord[] = [
    { id: '1', orderCode: 'OP-0001', operation: 'Hilado', machineCode: 'MC-001', plannedQty: 500, doneQty: 320, uom: 'kg', status: 'IN_PROGRESS', updatedAt: '2025-12-22' },
    { id: '2', orderCode: 'OP-0001', operation: 'Bobinado', machineCode: 'MC-002', plannedQty: 500, doneQty: 0, uom: 'kg', status: 'WAITING', updatedAt: '2025-12-22' },
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter((x) =>
      [x.orderCode, x.operation, x.machineCode, x.uom, x.status, x.updatedAt]
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(t))
    );
  }

  pct(it: WipRecord) {
    const p = Number(it.plannedQty || 0);
    const d = Number(it.doneQty || 0);
    if (p <= 0) return 0;
    return Math.min(100, Math.round((d / p) * 100));
  }

  statusBadge(s: WipStatus) {
    switch (s) {
      case 'DONE': return 'ui-badge-ok';
      case 'IN_PROGRESS': return 'ui-badge-warn';
      case 'BLOCKED': return 'ui-badge-bad';
      default: return 'ui-badge';
    }
  }

  submit() {
    if (!this.form.orderCode || !this.form.operation) return;

    const payload: Omit<WipRecord, 'id'> = {
      ...this.form,
      plannedQty: Number(this.form.plannedQty || 0),
      doneQty: Number(this.form.doneQty || 0),
    };

    if (this.editingId) {
      const idx = this.items.findIndex((x) => x.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    this.items.unshift({ id, ...payload });
    this.resetForm();
  }

  edit(it: WipRecord) {
    this.editingId = it.id;
    this.form = {
      orderCode: it.orderCode,
      operation: it.operation,
      machineCode: it.machineCode,
      plannedQty: it.plannedQty,
      doneQty: it.doneQty,
      uom: it.uom,
      status: it.status,
      updatedAt: it.updatedAt,
    };
  }

  remove(id: string) {
    this.items = this.items.filter((x) => x.id !== id);
    if (this.editingId === id) this.cancelEdit();
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      orderCode: '',
      operation: '',
      machineCode: '',
      plannedQty: 0,
      doneQty: 0,
      uom: 'kg',
      status: 'WAITING',
      updatedAt: '',
    };
  }
}
