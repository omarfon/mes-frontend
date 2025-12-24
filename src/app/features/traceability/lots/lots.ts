import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type LotType = 'MP' | 'WIP' | 'PT';
type LotStatus = 'AVAILABLE' | 'IN_PROCESS' | 'QUARANTINE' | 'BLOCKED' | 'CONSUMED' | 'CLOSED';

interface LotEvent {
  id: string;
  at: string;          // ISO datetime
  type: 'CREATED' | 'MOVED' | 'SPLIT' | 'MERGED' | 'CONSUMED' | 'PRODUCED' | 'BLOCKED' | 'UNBLOCKED' | 'QUARANTINED' | 'RELEASED' | 'NOTE';
  by: string;
  note?: string;
  meta?: Record<string, string | number>;
}

interface LotProperty {
  key: string;
  value: string;
  unit?: string;
}

interface Lot {
  id: string;
  code: string;            // LOT-...
  type: LotType;           // MP/WIP/PT
  itemCode: string;        // material/product code
  description: string;
  qty: number;
  uom: string;
  status: LotStatus;
  location: string;        // ALM-01 / RACK-...
  createdAt: string;       // YYYY-MM-DD
  expiresAt?: string;      // YYYY-MM-DD
  supplier?: string;
  batchRef?: string;       // referencia proveedor
  properties: LotProperty[];
  events: LotEvent[];
}

@Component({
  standalone: true,
  selector: 'app-lots',
  imports: [CommonModule, FormsModule],
  templateUrl: './lots.html',
})
export class LotsComponent {
  // filters
  q = '';
  type: 'ALL' | LotType = 'ALL';
  status: 'ALL' | LotStatus = 'ALL';
  location = 'ALL';

  // drawer
  drawerOpen = false;
  activeLotId: string | null = null;

  // quick actions
  moveTo = '';
  blockReason = '';
  noteText = '';

  // demo data
  lots: Lot[] = [
    {
      id: '1',
      code: 'LOT-MP-0001',
      type: 'MP',
      itemCode: 'MAT-ALG',
      description: 'Algodón Pima',
      qty: 1200,
      uom: 'kg',
      status: 'AVAILABLE',
      location: 'ALM-01/R1/N2',
      createdAt: '2025-12-18',
      supplier: 'Proveedor Andino',
      batchRef: 'PA-2025-881',
      properties: [
        { key: 'Micronaire', value: '4.1' },
        { key: 'Humedad', value: '7.8', unit: '%' },
        { key: 'Color', value: 'Blanco' },
      ],
      events: [
        { id: 'e1', at: '2025-12-18T09:10:00', type: 'CREATED', by: 'admin', note: 'Ingreso de MP' },
        { id: 'e2', at: '2025-12-19T11:30:00', type: 'MOVED', by: 'almacen', meta: { from: 'ALM-01/RECEP', to: 'ALM-01/R1/N2' } },
      ],
    },
    {
      id: '2',
      code: 'LOT-WIP-0042',
      type: 'WIP',
      itemCode: 'WIP-PAB-20',
      description: 'Pabilo 20/1',
      qty: 460,
      uom: 'kg',
      status: 'IN_PROCESS',
      location: 'PLANTA/HIL-01',
      createdAt: '2025-12-22',
      properties: [{ key: 'Orden', value: 'OP-0001' }],
      events: [
        { id: 'e3', at: '2025-12-22T08:05:00', type: 'PRODUCED', by: 'operador1', note: 'Salida de hilado' },
        { id: 'e4', at: '2025-12-22T10:20:00', type: 'MOVED', by: 'operador1', meta: { from: 'PLANTA/HIL-01', to: 'PLANTA/BOB-01' } },
      ],
    },
    {
      id: '3',
      code: 'LOT-PT-0108',
      type: 'PT',
      itemCode: 'PT-HIL-20',
      description: 'Hilo 20/1 Bobinas',
      qty: 300,
      uom: 'kg',
      status: 'QUARANTINE',
      location: 'ALM-PT/QC',
      createdAt: '2025-12-23',
      properties: [{ key: 'Inspección', value: 'PENDIENTE' }],
      events: [
        { id: 'e5', at: '2025-12-23T14:10:00', type: 'PRODUCED', by: 'operador2' },
        { id: 'e6', at: '2025-12-23T15:00:00', type: 'QUARANTINED', by: 'calidad', note: 'Retenido por muestreo' },
      ],
    },
  ];

  // Form para crear/editar (en el drawer)
  editing = false;
  form: Partial<Lot> = {};

  get locations() {
    return Array.from(new Set(this.lots.map(l => l.location))).sort();
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    return this.lots.filter(l => {
      if (this.type !== 'ALL' && l.type !== this.type) return false;
      if (this.status !== 'ALL' && l.status !== this.status) return false;
      if (this.location !== 'ALL' && l.location !== this.location) return false;

      if (t) {
        const hay = [l.code, l.type, l.itemCode, l.description, l.status, l.location, l.supplier ?? '', l.batchRef ?? '']
          .join(' ')
          .toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }

  get activeLot(): Lot | null {
    if (!this.activeLotId) return null;
    return this.lots.find(l => l.id === this.activeLotId) ?? null;
  }

  // UI helpers
  typeBadge(t: LotType) {
    switch (t) {
      case 'MP': return 'bg-slate-500/10 text-slate-200 border-slate-500/20';
      case 'WIP': return 'bg-blue-500/15 text-blue-200 border-blue-500/30';
      default: return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30';
    }
  }

  statusBadge(s: LotStatus) {
    switch (s) {
      case 'AVAILABLE': return 'ui-badge-ok';
      case 'IN_PROCESS': return 'ui-badge-warn';
      case 'QUARANTINE': return 'bg-amber-500/15 text-amber-200 border border-amber-500/30 rounded-full px-2 py-1 text-[11px]';
      case 'BLOCKED': return 'ui-badge-bad';
      case 'CONSUMED': return 'bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
      default: return 'bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
    }
  }

  openDrawer(lot: Lot) {
    this.drawerOpen = true;
    this.activeLotId = lot.id;
    this.editing = false;
    this.form = { ...lot, properties: [...lot.properties] };
    this.moveTo = '';
    this.blockReason = '';
    this.noteText = '';
  }

  newLot() {
    this.drawerOpen = true;
    this.activeLotId = null;
    this.editing = true;
    this.form = {
      code: `LOT-${Date.now()}`,
      type: 'MP',
      itemCode: '',
      description: '',
      qty: 0,
      uom: 'kg',
      status: 'AVAILABLE',
      location: '',
      createdAt: new Date().toISOString().slice(0, 10),
      properties: [],
      events: [],
    };
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.activeLotId = null;
    this.editing = false;
    this.form = {};
  }

  startEdit() {
    this.editing = true;
  }

  saveLot() {
    // validación mínima
    if (!this.form.code || !this.form.type || !this.form.itemCode || !this.form.description) return;

    const payload: Lot = {
      id: this.activeLotId ?? (crypto.randomUUID?.() ?? String(Date.now())),
      code: this.form.code!,
      type: this.form.type as LotType,
      itemCode: this.form.itemCode!,
      description: this.form.description!,
      qty: Number(this.form.qty || 0),
      uom: this.form.uom || 'kg',
      status: (this.form.status as LotStatus) ?? 'AVAILABLE',
      location: this.form.location || '',
      createdAt: this.form.createdAt || new Date().toISOString().slice(0, 10),
      expiresAt: this.form.expiresAt || '',
      supplier: this.form.supplier || '',
      batchRef: this.form.batchRef || '',
      properties: (this.form.properties as LotProperty[]) ?? [],
      events: (this.form.events as LotEvent[]) ?? [],
    };

    if (!this.activeLotId) {
      payload.events = [
        { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'CREATED', by: 'admin', note: 'Lote creado' },
        ...payload.events,
      ];
      this.lots.unshift(payload);
      this.activeLotId = payload.id;
    } else {
      const idx = this.lots.findIndex(l => l.id === this.activeLotId);
      if (idx >= 0) this.lots[idx] = payload;
    }

    this.editing = false;
  }

  addProperty() {
    if (!this.form.properties) this.form.properties = [];
    (this.form.properties as LotProperty[]).push({ key: '', value: '', unit: '' });
  }

  removeProperty(i: number) {
    (this.form.properties as LotProperty[]).splice(i, 1);
  }

  // Quick actions (simuladas)
  moveLot() {
    const lot = this.activeLot;
    if (!lot || !this.moveTo.trim()) return;

    const from = lot.location;
    lot.location = this.moveTo.trim();
    lot.events = [
      { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'MOVED', by: 'almacen', meta: { from, to: lot.location } },
      ...lot.events,
    ];
    this.moveTo = '';
  }

  blockLot() {
    const lot = this.activeLot;
    if (!lot || !this.blockReason.trim()) return;

    lot.status = 'BLOCKED';
    lot.events = [
      { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'BLOCKED', by: 'calidad', note: this.blockReason.trim() },
      ...lot.events,
    ];
    this.blockReason = '';
  }

  quarantineLot() {
    const lot = this.activeLot;
    if (!lot) return;
    lot.status = 'QUARANTINE';
    lot.events = [
      { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'QUARANTINED', by: 'calidad', note: 'En cuarentena' },
      ...lot.events,
    ];
  }

  releaseLot() {
    const lot = this.activeLot;
    if (!lot) return;
    lot.status = 'AVAILABLE';
    lot.events = [
      { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'RELEASED', by: 'calidad', note: 'Liberado' },
      ...lot.events,
    ];
  }

  addNote() {
    const lot = this.activeLot;
    if (!lot || !this.noteText.trim()) return;
    lot.events = [
      { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'NOTE', by: 'user', note: this.noteText.trim() },
      ...lot.events,
    ];
    this.noteText = '';
  }

  printLabel() {
    // placeholder: luego lo conectamos a /labels (PDF/ZPL)
    const lot = this.activeLot;
    if (!lot) return;
    lot.events = [
      { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'NOTE', by: 'system', note: 'Etiqueta enviada a impresión' },
      ...lot.events,
    ];
  }
}
