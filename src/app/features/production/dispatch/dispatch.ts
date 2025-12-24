import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DispatchLine {
  id: string;
  orderCode: string;
  materialCode: string;
  qty: number;
  uom: string;
  location: string;
  issuedAt: string; // YYYY-MM-DD
}

@Component({
  standalone: true,
  selector: 'app-dispatch',
  imports: [CommonModule, FormsModule],
  templateUrl: './dispatch.html',
})
export class DispatchComponent {
  q = '';
  editingId: string | null = null;

  form: Omit<DispatchLine, 'id'> = {
    orderCode: '',
    materialCode: '',
    qty: 0,
    uom: 'kg',
    location: '',
    issuedAt: '',
  };

  items: DispatchLine[] = [
    { id: '1', orderCode: 'OP-0001', materialCode: 'MAT-ALG', qty: 200, uom: 'kg', location: 'ALM-01', issuedAt: '2025-12-22' },
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.orderCode, x.materialCode, x.location, x.uom, x.issuedAt].some(v => String(v).toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.orderCode || !this.form.materialCode) return;

    if (this.editingId) {
      const idx = this.items.findIndex(x => x.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...this.form, qty: Number(this.form.qty) };
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    this.items.unshift({ id, ...this.form, qty: Number(this.form.qty) });
    this.resetForm();
  }

  edit(it: DispatchLine) {
    this.editingId = it.id;
    this.form = { orderCode: it.orderCode, materialCode: it.materialCode, qty: it.qty, uom: it.uom, location: it.location, issuedAt: it.issuedAt };
  }

  remove(id: string) {
    this.items = this.items.filter(x => x.id !== id);
    if (this.editingId === id) this.cancelEdit();
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = { orderCode: '', materialCode: '', qty: 0, uom: 'kg', location: '', issuedAt: '' };
  }
}
