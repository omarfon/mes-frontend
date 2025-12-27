import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraceabilityStoreService, SerialUnit, SerialUnitType } from '../services/traceability-store.service';

@Component({
  standalone: true,
  selector: 'app-serials',
  imports: [CommonModule, FormsModule],
  templateUrl: './serials.html',
})
export class SerialsComponent {
  // Generación
  lotCode = '';
  prefix = '';
  count = 10;
  unitType: SerialUnitType = 'PALLET';
  qtyPerUnit = 1;
  genLocation = '';

  // Scan mode
  scan = '';
  action: 'MOVE' | 'BLOCK' | 'QUARANTINE' | 'RELEASE' | 'NOTE' = 'MOVE';
  toLocation = '';
  note = '';

  // Search/list
  q = '';
  selected: SerialUnit | null = null;
  error = '';
  success = '';

  constructor(public store: TraceabilityStoreService) {}

  clearMsg() {
    this.error = '';
    this.success = '';
  }

  gen() {
    this.clearMsg();
    try {
      this.store.createSerials({
        lotCode: this.lotCode.trim(),
        prefix: this.prefix.trim(),
        count: Number(this.count || 0),
        unitType: this.unitType,
        qtyPerUnit: Number(this.qtyPerUnit || 0),
        location: this.genLocation.trim() || undefined,
        by: 'user',
      });
      this.success = `Generados ${this.count} serial(es).`;
    } catch (e: any) {
      this.error = e?.message ?? 'Error al generar seriales';
    }
  }

  resolve() {
    this.clearMsg();
    const s = this.store.serials.find(serial => serial.serial === this.scan.trim());
    if (!s) {
      this.selected = null;
      this.error = 'Serial no encontrado';
      return;
    }
    this.selected = s;
    this.success = `Serial cargado: ${s.serial}`;
    if (!this.toLocation) this.toLocation = s.location;
  }

  onScanEnter() {
    this.resolve();
  }

  apply() {
    this.clearMsg();
    if (!this.scan.trim()) {
      this.error = 'Escanea un serial';
      return;
    }
    try {
      this.store.scanSerial({
        serial: this.scan.trim(),
        action: this.action,
        toLocation: this.toLocation.trim() || undefined,
        note: this.note.trim() || undefined,
        by: 'user',
      });
      const updated = this.store.serials.find(s => s.serial === this.scan.trim());
      this.selected = updated ?? null;
      this.success = `Acción aplicada: ${this.action}`;
      this.note = '';
      if (this.action !== 'MOVE' && updated) this.toLocation = updated.location;
    } catch (e: any) {
      this.error = e?.message ?? 'Error al aplicar';
    }
  }

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.store.serials.filter(s => {
      if (!t) return true;
      const hay = [s.serial, s.lotCode, s.itemCode, s.unitType, s.status, s.location, s.packedIn ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(t);
    });
  }

  badge(st: string) {
    switch (st) {
      case 'OK': return 'ui-badge-ok';
      case 'BLOCKED': return 'ui-badge-bad';
      case 'QUARANTINE': return 'bg-amber-500/15 text-amber-200 border border-amber-500/30 rounded-full px-2 py-1 text-[11px]';
      default: return 'ui-badge';
    }
  }

  open(s: SerialUnit) {
    this.selected = s;
    this.scan = s.serial;
    this.toLocation = s.location;
  }
}
