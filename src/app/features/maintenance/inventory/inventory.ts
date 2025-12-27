import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService, InventoryTxnType, SparePart } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
})
export class InventoryComponent {
  q = '';
  selected: SparePart | null = null;
  error = '';
  success = '';

  txn = {
    type: 'IN' as InventoryTxnType,
    spareCode: 'REP-001',
    qty: 1,
    ref: '',
    by: 'almacén',
    note: '',
  };

  constructor(public ms: MaintenanceStoreService) {}

  kpi() { return this.ms.inventoryKpis(); }

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.ms.spares.filter(s => {
      if (!t) return true;
      return [s.code, s.name, s.location ?? '', s.uom].join(' ').toLowerCase().includes(t);
    });
  }

  open(s: SparePart) {
    this.selected = s;
    this.error = ''; this.success = '';
    this.txn.spareCode = s.code;
  }

  applyTxn() {
    this.error = ''; this.success = '';
    try {
      this.ms.applyInventoryTxn({
        type: this.txn.type,
        spareCode: this.txn.spareCode,
        qty: Number(this.txn.qty || 0),
        ref: this.txn.ref?.trim() || undefined,
        by: this.txn.by?.trim() || 'almacén',
        note: this.txn.note?.trim() || undefined,
      });
      this.success = 'Movimiento registrado';
      this.txn.ref = ''; this.txn.note = ''; this.txn.qty = 1;
    } catch (e: any) {
      this.error = e?.message ?? 'Error inventario';
    }
  }

  badgeStock(s: SparePart) {
    if (s.stock <= 0) return 'bg-rose-500/10 text-rose-200 border border-rose-500/20 rounded-full px-2 py-1 text-[11px]';
    if (s.stock <= s.minStock) return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
    return 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 rounded-full px-2 py-1 text-[11px]';
  }
}
