import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'DRAFT' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface ProductionOrder {
  id: string;
  code: string;
  productCode: string;
  machineCode?: string;
  plannedQty: number;
  doneQty: number;
  uom: string;
  dueDate?: string; // YYYY-MM-DD
  status: OrderStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

type GroupBy = 'status' | 'product' | 'machine' | 'due';

@Component({
  standalone: true,
  selector: 'app-production-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
})
export class BoardComponent {
  // demo data (luego lo conectamos al backend)
  orders: ProductionOrder[] = [
    { id: '1', code: 'OP-0001', productCode: 'PRD-HIL-20', machineCode: 'MC-001', plannedQty: 500, doneQty: 320, uom: 'kg', dueDate: '2025-12-30', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: '2', code: 'OP-0002', productCode: 'PRD-TEL-180', machineCode: 'MC-002', plannedQty: 1200, doneQty: 0, uom: 'm', dueDate: '2025-12-26', status: 'RELEASED', priority: 'MEDIUM' },
    { id: '3', code: 'OP-0003', productCode: 'PRD-HIL-30', machineCode: 'MC-001', plannedQty: 300, doneQty: 300, uom: 'kg', dueDate: '2025-12-20', status: 'COMPLETED', priority: 'LOW' },
    { id: '4', code: 'OP-0004', productCode: 'PRD-HIL-20', machineCode: 'MC-003', plannedQty: 700, doneQty: 0, uom: 'kg', dueDate: '2025-12-24', status: 'RELEASED', priority: 'HIGH' },
    { id: '5', code: 'OP-0005', productCode: 'PRD-TEL-180', machineCode: 'MC-002', plannedQty: 900, doneQty: 150, uom: 'm', dueDate: '2025-12-23', status: 'IN_PROGRESS', priority: 'MEDIUM' },
  ];

  // filters
  q = '';
  status: 'ALL' | OrderStatus = 'ALL';
  product = 'ALL';
  machine = 'ALL';
  dueFrom = '';
  dueTo = '';

  groupBy: GroupBy = 'status';

  get products() {
    return Array.from(new Set(this.orders.map(o => o.productCode))).sort();
  }

  get machines() {
    return Array.from(new Set(this.orders.map(o => o.machineCode).filter(Boolean) as string[])).sort();
  }

  // derived
  get filtered() {
    const t = this.q.trim().toLowerCase();
    const from = this.dueFrom ? new Date(this.dueFrom) : null;
    const to = this.dueTo ? new Date(this.dueTo) : null;

    return this.orders.filter(o => {
      if (t) {
        const hay = [o.code, o.productCode, o.machineCode ?? '', o.status, o.priority].join(' ').toLowerCase();
        if (!hay.includes(t)) return false;
      }
      if (this.status !== 'ALL' && o.status !== this.status) return false;
      if (this.product !== 'ALL' && o.productCode !== this.product) return false;
      if (this.machine !== 'ALL' && (o.machineCode ?? '') !== this.machine) return false;

      if ((from || to) && o.dueDate) {
        const d = new Date(o.dueDate);
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  }

  get overdueCount() {
    const today = new Date();
    return this.filtered.filter(o => o.dueDate && new Date(o.dueDate) < today && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
  }

  get kpi() {
    const total = this.filtered.length;
    const released = this.filtered.filter(o => o.status === 'RELEASED').length;
    const inProgress = this.filtered.filter(o => o.status === 'IN_PROGRESS').length;
    const completed = this.filtered.filter(o => o.status === 'COMPLETED').length;
    return { total, released, inProgress, completed };
  }

  pct(o: ProductionOrder) {
    if (!o.plannedQty) return 0;
    return Math.min(100, Math.round((o.doneQty / o.plannedQty) * 100));
  }

  groupKey(o: ProductionOrder) {
    switch (this.groupBy) {
      case 'product': return o.productCode;
      case 'machine': return o.machineCode || 'Sin máquina';
      case 'due': {
        if (!o.dueDate) return 'Sin vencimiento';
        const d = new Date(o.dueDate);
        const today = new Date();
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Vencidas';
        if (diff <= 2) return '0-2 días';
        if (diff <= 7) return '3-7 días';
        return '8+ días';
      }
      default: return o.status;
    }
  }

  get groups() {
    const map = new Map<string, ProductionOrder[]>();
    for (const o of this.filtered) {
      const k = this.groupKey(o);
      map.set(k, [...(map.get(k) ?? []), o]);
    }
    // order groups nicely
    const keys = Array.from(map.keys());
    const ordered =
      this.groupBy === 'status'
        ? ['DRAFT', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].filter(k => keys.includes(k))
        : this.groupBy === 'due'
          ? ['Vencidas', '0-2 días', '3-7 días', '8+ días', 'Sin vencimiento'].filter(k => keys.includes(k))
          : keys.sort();

    return ordered.map(key => ({ key, items: map.get(key)! }));
  }

  badgeStatus(s: OrderStatus) {
    switch (s) {
      case 'RELEASED': return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/15 text-blue-200 border-blue-500/30';
      case 'COMPLETED': return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30';
      case 'CANCELLED': return 'bg-rose-500/15 text-rose-200 border-rose-500/30';
      default: return 'bg-slate-500/10 text-slate-200 border-slate-500/20';
    }
  }

  badgePriority(p: ProductionOrder['priority']) {
    switch (p) {
      case 'HIGH': return 'bg-rose-500/15 text-rose-200 border-rose-500/30';
      case 'MEDIUM': return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
      default: return 'bg-slate-500/10 text-slate-200 border-slate-500/20';
    }
  }
}
