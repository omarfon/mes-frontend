import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraceabilityStoreService, Movement, MovementType, Lot } from '../services/traceability-store';

@Component({
  standalone: true,
  selector: 'app-movements',
  imports: [CommonModule, FormsModule],
  templateUrl: './movements.html',
})
export class MovementsComponent {
  // modo escaneo
  scanCode = '';
  selectedLot: Lot | null = null;
  error = '';
  success = '';

  // filtros/kardex
  q = '';
  type: 'ALL' | MovementType = 'ALL';

  // formulario movimiento
  form: Omit<Movement, 'id' | 'at' | 'lotId' | 'fromLocation' | 'uom'> & { uom?: string } = {
    type: 'TRANSFER',
    lotCode: '',
    qty: 0,
    uom: '',
    toLocation: '',
    orderCode: '',
    operation: '',
    machineCode: '',
    shiftCode: 'A',
    by: 'user',
    reason: '',
    note: '',
  };

  constructor(public store: TraceabilityStoreService) {}

  // escanear / buscar
  resolveLot() {
    this.error = '';
    this.success = '';
    const code = this.scanCode.trim();
    if (!code) return;

    const lot = this.store.findLotByCode(code);
    if (!lot) {
      this.selectedLot = null;
      this.error = 'Lote no encontrado';
      return;
    }

    this.selectedLot = lot;
    this.form.lotCode = lot.code;
    this.form.uom = lot.uom;

    // defaults útiles
    if (this.form.type === 'TRANSFER') this.form.toLocation = lot.location;
    this.success = `Lote cargado: ${lot.code}`;
  }

  onScanEnter() {
    this.resolveLot();
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.form.lotCode) {
      this.error = 'Primero escanea/selecciona un lote';
      return;
    }

    // Validación por tipo
    if (this.form.type === 'TRANSFER') {
      if (!this.form.toLocation?.trim()) {
        this.error = 'Destino requerido';
        return;
      }
      // para transfer, qty puede ser 0 (no cambia stock)
      if (!this.form.qty) this.form.qty = 0;
    } else {
      if (Number(this.form.qty) <= 0) {
        this.error = 'Cantidad debe ser mayor a 0';
        return;
      }
    }

    const payload: Movement = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      at: new Date().toISOString(),
      type: this.form.type,
      lotCode: this.form.lotCode,
      qty: Number(this.form.qty || 0),
      uom: this.form.uom || (this.selectedLot?.uom ?? ''),
      toLocation: this.form.toLocation?.trim(),
      orderCode: this.form.orderCode?.trim(),
      operation: this.form.operation?.trim(),
      machineCode: this.form.machineCode?.trim(),
      shiftCode: this.form.shiftCode?.trim(),
      by: this.form.by?.trim() || 'user',
      reason: this.form.reason?.trim(),
      note: this.form.note?.trim(),
    };

    try {
      const updatedLot = this.store.applyMovement(payload);
      this.selectedLot = updatedLot;
      this.success = `Movimiento aplicado (${payload.type})`;
      // limpiar campos “operativos”
      this.form.qty = 0;
      this.form.reason = '';
      this.form.note = '';
      if (payload.type !== 'TRANSFER') this.form.toLocation = updatedLot.location;
    } catch (e: any) {
      this.error = e?.message ?? 'Error al aplicar movimiento';
    }
  }

  get movements() {
    const t = this.q.trim().toLowerCase();
    return this.store.movements.filter(m => {
      if (this.type !== 'ALL' && m.type !== this.type) return false;
      if (!t) return true;
      const hay = [m.lotCode, m.type, m.by, m.reason ?? '', m.note ?? '', m.orderCode ?? '', m.operation ?? '', m.machineCode ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(t);
    });
  }

  badgeType(mt: MovementType) {
    switch (mt) {
      case 'TRANSFER': return 'bg-blue-500/15 text-blue-200 border border-blue-500/30 rounded-full px-2 py-1 text-[11px]';
      case 'CONSUME': return 'bg-amber-500/15 text-amber-200 border border-amber-500/30 rounded-full px-2 py-1 text-[11px]';
      case 'ADJUST': return 'bg-slate-500/10 text-slate-200 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'SCRAP': return 'bg-rose-500/15 text-rose-200 border border-rose-500/30 rounded-full px-2 py-1 text-[11px]';
      default: return 'bg-slate-500/10 text-slate-200 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
    }
  }
}
