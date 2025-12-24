import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'DRAFT' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface ProductionOrder {
  id: string;
  code: string;
  productCode: string;
  plannedQty: number;
  uom: string;
  dueDate: string; // YYYY-MM-DD
  status: OrderStatus;
}

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
})
export class OrdersComponent {
  q = '';
  editingId: string | null = null;

  form: Omit<ProductionOrder, 'id'> = {
    code: '',
    productCode: '',
    plannedQty: 0,
    uom: 'kg',
    dueDate: '',
    status: 'DRAFT',
  };

  items: ProductionOrder[] = [
    { id: '1', code: 'OP-0001', productCode: 'PRD-HIL-20', plannedQty: 500, uom: 'kg', dueDate: '2025-12-30', status: 'RELEASED' },
    { id: '2', code: 'OP-0002', productCode: 'PRD-TEL-180', plannedQty: 1200, uom: 'm', dueDate: '2026-01-05', status: 'DRAFT' },
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.productCode, x.uom, x.status, x.dueDate].some(v => String(v).toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.code || !this.form.productCode) return;

    if (this.editingId) {
      const idx = this.items.findIndex(x => x.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...this.form, plannedQty: Number(this.form.plannedQty) };
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    this.items.unshift({ id, ...this.form, plannedQty: Number(this.form.plannedQty) });
    this.resetForm();
  }

  edit(it: ProductionOrder) {
    this.editingId = it.id;
    this.form = { code: it.code, productCode: it.productCode, plannedQty: it.plannedQty, uom: it.uom, dueDate: it.dueDate, status: it.status };
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
    this.form = { code: '', productCode: '', plannedQty: 0, uom: 'kg', dueDate: '', status: 'DRAFT' };
  }

  badgeClass(s: OrderStatus) {
    switch (s) {
      case 'RELEASED': return 'ui-badge-warn';
      case 'IN_PROGRESS': return 'ui-badge';
      case 'COMPLETED': return 'ui-badge-ok';
      case 'CANCELLED': return 'ui-badge-bad';
      default: return 'ui-badge';
    }
  }
}
