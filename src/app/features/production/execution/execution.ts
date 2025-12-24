import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ExecutionStatus = 'OPEN' | 'CLOSED';

interface ExecutionRecord {
  id: string;
  orderCode: string;
  machineCode: string;
  shiftCode: string;
  producedGood: number;
  producedScrap: number;
  uom: string;
  startedAt: string; // YYYY-MM-DD
  endedAt: string;   // YYYY-MM-DD (opcional)
  status: ExecutionStatus;
  notes: string;
}

@Component({
  standalone: true,
  selector: 'app-execution',
  imports: [CommonModule, FormsModule],
  templateUrl: './execution.html',
})
export class ExecutionComponent {
  q = '';
  editingId: string | null = null;

  form: Omit<ExecutionRecord, 'id'> = {
    orderCode: '',
    machineCode: '',
    shiftCode: 'A',
    producedGood: 0,
    producedScrap: 0,
    uom: 'kg',
    startedAt: '',
    endedAt: '',
    status: 'OPEN',
    notes: '',
  };

  items: ExecutionRecord[] = [
    {
      id: '1',
      orderCode: 'OP-0001',
      machineCode: 'MC-001',
      shiftCode: 'A',
      producedGood: 120,
      producedScrap: 5,
      uom: 'kg',
      startedAt: '2025-12-22',
      endedAt: '',
      status: 'OPEN',
      notes: 'Arranque normal',
    },
    {
      id: '2',
      orderCode: 'OP-0001',
      machineCode: 'MC-002',
      shiftCode: 'B',
      producedGood: 200,
      producedScrap: 10,
      uom: 'kg',
      startedAt: '2025-12-22',
      endedAt: '2025-12-22',
      status: 'CLOSED',
      notes: 'Se cerró turno',
    },
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter((x) =>
      [x.orderCode, x.machineCode, x.shiftCode, x.uom, x.status, x.startedAt, x.endedAt, x.notes]
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(t))
    );
  }

  get totalGood() {
    return this.filtered.reduce((s, x) => s + Number(x.producedGood || 0), 0);
  }

  get totalScrap() {
    return this.filtered.reduce((s, x) => s + Number(x.producedScrap || 0), 0);
  }

  submit() {
    if (!this.form.orderCode || !this.form.machineCode) return;

    const payload: Omit<ExecutionRecord, 'id'> = {
      ...this.form,
      producedGood: Number(this.form.producedGood || 0),
      producedScrap: Number(this.form.producedScrap || 0),
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

  edit(it: ExecutionRecord) {
    this.editingId = it.id;
    this.form = {
      orderCode: it.orderCode,
      machineCode: it.machineCode,
      shiftCode: it.shiftCode,
      producedGood: it.producedGood,
      producedScrap: it.producedScrap,
      uom: it.uom,
      startedAt: it.startedAt,
      endedAt: it.endedAt,
      status: it.status,
      notes: it.notes,
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
      machineCode: '',
      shiftCode: 'A',
      producedGood: 0,
      producedScrap: 0,
      uom: 'kg',
      startedAt: '',
      endedAt: '',
      status: 'OPEN',
      notes: '',
    };
  }

  statusBadge(s: ExecutionStatus) {
    return s === 'CLOSED' ? 'ui-badge-ok' : 'ui-badge-warn';
  }
}
