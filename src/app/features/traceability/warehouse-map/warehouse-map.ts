import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraceabilityStoreService, WarehouseLocation } from '../services/traceability-store.service';

type HeatMode = 'LOTS' | 'SERIALS' | 'NONE';

@Component({
  standalone: true,
  selector: 'app-warehouse-map',
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-map.html',
})
export class WarehouseMapComponent {
  zone = 'ALM-01';
  area = 'MP';
  q = '';
  heat: HeatMode = 'LOTS';

  selected: WarehouseLocation | null = null;

  // Acciones rápidas (sobre ubicación seleccionada)
  moveLotCode = '';
  moveTo = '';
  message = '';
  error = '';

  constructor(public store: TraceabilityStoreService) {}

  get zones() {
    const z = this.store.getZones();
    // fallback si no hay nada en store
    return z.length ? z : ['ALM-01', 'ALM-PT', 'PLANTA'];
  }

  get areas() {
    const a = this.store.getAreas(this.zone);
    return a.length ? a : ['MP', 'WIP', 'PT', 'QC', 'PROD'];
  }

  get locations() {
    const list = this.store.getLocations(this.zone, this.area);
    const t = this.q.trim().toLowerCase();
    if (!t) return list;
    return list.filter(l => l.code.toLowerCase().includes(t) || (l.rack ?? '').toLowerCase().includes(t));
  }

  open(loc: WarehouseLocation) {
    this.selected = loc;
    this.message = '';
    this.error = '';
    this.moveTo = loc.code;
  }

  lotsInSelected() {
    if (!this.selected) return [];
    return this.store.getLotsInLocation(this.selected.code);
  }

  serialsInSelected() {
    if (!this.selected) return [];
    return this.store.getSerialsInLocation(this.selected.code);
  }

  // “ocupación” para pintar el mapa
  occupancy(loc: WarehouseLocation) {
    const lots = this.store.getLotsInLocation(loc.code).length;
    const serials = this.store.getSerialsInLocation(loc.code).length;
    return { lots, serials };
  }

  heatClass(loc: WarehouseLocation) {
    const { lots, serials } = this.occupancy(loc);
    const n = this.heat === 'LOTS' ? lots : this.heat === 'SERIALS' ? serials : 0;

    // 4 niveles visuales
    if (this.heat === 'NONE') return 'border-slate-800/70 bg-slate-950/30';
    if (n === 0) return 'border-slate-800/70 bg-slate-950/30';
    if (n <= 2) return 'border-blue-500/30 bg-blue-500/10';
    if (n <= 5) return 'border-amber-500/30 bg-amber-500/10';
    return 'border-rose-500/30 bg-rose-500/10';
  }

  // Acción rápida: mover un lote a la ubicación seleccionada
  moveLotHere() {
    this.message = '';
    this.error = '';
    if (!this.selected) return;

    const code = this.moveLotCode.trim();
    if (!code) {
      this.error = 'Ingresa el código del lote';
      return;
    }

    const lot = this.store.findLotByCode(code);
    if (!lot) {
      this.error = 'Lote no encontrado';
      return;
    }

    // Reutilizamos applyMovement para generar evento MOVED (transfer)
    try {
      this.store.applyMovement({
        id: crypto.randomUUID?.() ?? String(Date.now()),
        at: new Date().toISOString(),
        type: 'TRANSFER',
        lotCode: lot.code,
        qty: 0,
        uom: lot.uom,
        toLocation: this.selected.code,
        by: 'user',
        note: `Movimiento desde Mapa (${this.zone}/${this.area})`,
      });
      this.message = `Lote ${lot.code} movido a ${this.selected.code}`;
      this.moveLotCode = '';
    } catch (e: any) {
      this.error = e?.message ?? 'Error moviendo lote';
    }
  }
}
