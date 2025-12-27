import { Injectable } from '@angular/core';

export type LotType = 'MP' | 'WIP' | 'PT';
export type LotStatus = 'AVAILABLE' | 'IN_PROCESS' | 'QUARANTINE' | 'BLOCKED' | 'CONSUMED' | 'CLOSED';
export type SerialUnitType = 'PIECE' | 'BOX' | 'PALLET' | 'CONTAINER';

export interface LotEvent {
  id: string;
  at: string; // ISO datetime
  type: 'CREATED' | 'MOVED' | 'SPLIT' | 'MERGED' | 'CONSUMED' | 'PRODUCED' | 'BLOCKED' | 'UNBLOCKED' | 'QUARANTINED' | 'RELEASED' | 'NOTE';
  by: string;
  note?: string;
  meta?: Record<string, string | number>;
}

export interface LotProperty {
  key: string;
  value: string;
  unit?: string;
}

export interface Lot {
  id: string;
  code: string;
  type: LotType;
  itemCode: string;
  description: string;
  qty: number;
  uom: string;
  status: LotStatus;
  location: string;
  createdAt: string;
  expiresAt?: string;
  supplier?: string;
  batchRef?: string;
  properties: LotProperty[];
  events: LotEvent[];
}

export type MovementType = 'TRANSFER' | 'CONSUME' | 'PRODUCE' | 'ADJUST' | 'RETURN' | 'SCRAP' | 'REWORK';

export interface Movement {
  id: string;
  at: string; // ISO datetime
  type: MovementType;

  lotCode: string;
  lotId?: string;

  qty: number;
  uom: string;

  fromLocation?: string;
  toLocation?: string;

  orderCode?: string;
  operation?: string;
  machineCode?: string;
  shiftCode?: string;

  by: string;
  reason?: string;
  note?: string;
}

export type LinkType = 'PRODUCE' | 'CONSUME' | 'SPLIT' | 'MERGE' | 'REWORK';

export interface LotLink {
  id: string;
  at: string;              // ISO datetime
  type: LinkType;

  parentLotCode: string;   // “de”
  childLotCode: string;    // “hacia”

  qty?: number;
  uom?: string;

  orderCode?: string;
  operation?: string;
  by: string;
  note?: string;
}

export type SerialStatus = 'OK' | 'BLOCKED' | 'QUARANTINE' | 'SCRAPPED';

export interface SerialEvent {
  id: string;
  at: string;
  type: 'CREATED' | 'SCANNED' | 'MOVED' | 'PACKED' | 'UNPACKED' | 'BLOCKED' | 'UNBLOCKED' | 'QUARANTINED' | 'RELEASED' | 'NOTE';
  by: string;
  note?: string;
  meta?: Record<string, string | number>;
}

export interface SerialUnit {
  id: string;
  serial: string;      // SER-...
  lotCode: string;     // lote al que pertenece
  itemCode: string;
  uom: string;

  // unidad (ej: bobina/rollo/caja)
  unitType: 'BOBINA' | 'ROLLO' | 'CAJA' | 'PALLET' | 'OTRO';
  qty: number;

  status: SerialStatus;
  location: string;

  packedIn?: string;   // serial de caja/pallet contenedor
  createdAt: string;   // YYYY-MM-DD
  events: SerialEvent[];
}

export interface WarehouseLocation {
  id: string;
  code: string;       // ALM-01/R1/N2
  zone: string;       // ALM-01
  area: string;       // MP / WIP / PT / QC
  rack?: string;      // R1
  level?: string;     // N2
  capacity?: number;  // opcional
  notes?: string;
}





@Injectable({ providedIn: 'root' })
export class TraceabilityStoreService {
  createSerials(arg0: { lotCode: string; prefix: string; count: number; unitType: SerialUnitType; qtyPerUnit: number; location: string | undefined; by: string; }) {
    throw new Error('Method not implemented.');
  }
  findSerial // ISO datetime
    (arg0: string) {
      throw new Error('Method not implemented.');
  }
  scanSerial(arg0: { serial: string; action: "MOVE" | "BLOCK" | "QUARANTINE" | "RELEASE" | "NOTE"; toLocation: string | undefined; note: string | undefined; by: string; }) {
    throw new Error('Method not implemented.');
  }
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
      ],
      events: [
        { id: 'e1', at: '2025-12-18T09:10:00', type: 'CREATED', by: 'admin', note: 'Ingreso de MP' },
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
      events: [{ id: 'e3', at: '2025-12-22T08:05:00', type: 'PRODUCED', by: 'operador1' }],
    },
  ];

  movements: Movement[] = [];
  links: LotLink[] = [];
serials: SerialUnit[] = [];

  

  
  findLotByCode(code: string) {
    return this.lots.find(l => l.code === code) ?? null;
  }

  // ✅ aplica movimiento y genera evento
  applyMovement(m: Movement) {
    const lot = this.findLotByCode(m.lotCode);
    if (!lot) throw new Error('Lote no encontrado');

    // validaciones base
    if (lot.status === 'BLOCKED' || lot.status === 'QUARANTINE') {
      throw new Error(`Lote en estado ${lot.status}. No se permite mover/consumir.`);
    }

    // normaliza
    m.lotId = lot.id;
    m.uom = m.uom || lot.uom;

    const eventBase = {
      id: `e-${Date.now()}`,
      at: m.at,
      by: m.by,
    } as const;

    switch (m.type) {
      case 'TRANSFER': {
        const from = lot.location;
        const to = m.toLocation?.trim();
        if (!to) throw new Error('Destino requerido');
        lot.location = to;
        lot.events.unshift({
          ...eventBase,
          type: 'MOVED',
          meta: { from, to },
          note: m.note,
        });
        m.fromLocation = from;
        m.toLocation = to;
        break;
      }

      case 'CONSUME': {
        if (m.qty <= 0) throw new Error('Cantidad inválida');
        if (m.qty > lot.qty) throw new Error('No hay stock suficiente');
        lot.qty = Number((lot.qty - m.qty).toFixed(3));
        lot.events.unshift({
          ...eventBase,
          type: 'CONSUMED',
          meta: { qty: m.qty, uom: lot.uom, order: m.orderCode ?? '', op: m.operation ?? '' },
          note: m.note,
        });
        if (lot.qty === 0) lot.status = 'CONSUMED';
        break;
      }

      case 'ADJUST': {
        // ajuste puede ser + o -
        const newQty = lot.qty + m.qty;
        if (newQty < 0) throw new Error('Ajuste deja stock negativo');
        lot.qty = Number(newQty.toFixed(3));
        lot.events.unshift({
          ...eventBase,
          type: 'NOTE',
          note: `Ajuste de stock: ${m.qty} ${lot.uom}. Motivo: ${m.reason ?? '-'}`,
        });
        break;
      }

      case 'SCRAP': {
        if (m.qty <= 0) throw new Error('Cantidad inválida');
        if (m.qty > lot.qty) throw new Error('No hay stock suficiente');
        lot.qty = Number((lot.qty - m.qty).toFixed(3));
        lot.events.unshift({
          ...eventBase,
          type: 'NOTE',
          note: `Merma: ${m.qty} ${lot.uom}. Motivo: ${m.reason ?? '-'}`,
        });
        if (lot.qty === 0) lot.status = 'CLOSED';
        break;
      }

      // PRODUCE/RETURN/REWORK: lo dejamos listo para siguiente iteración
      default: {
        lot.events.unshift({
          ...eventBase,
          type: 'NOTE',
          note: `Movimiento ${m.type} registrado`,
        });
        break;
      }
    }

    this.movements.unshift(m);
    return lot;
  }

  createLink(link: Omit<LotLink, 'id' | 'at'>) {
  const payload: LotLink = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    at: new Date().toISOString(),
    ...link,
  };
  this.links.unshift(payload);
  return payload;
}

getUpstream(lotCode: string) {
  // padres directos: links donde child == lot
  return this.links.filter(l => l.childLotCode === lotCode);
}

getDownstream(lotCode: string) {
  // hijos directos: links donde parent == lot
  return this.links.filter(l => l.parentLotCode === lotCode);
}

// --- acciones base (split / merge)
splitLot(params: {
  parentLotCode: string;
  children: { code: string; qty: number; uom?: string; itemCode?: string; description?: string; location?: string; type?: LotType }[];
  by: string;
  note?: string;
}) {
  const parent = this.findLotByCode(params.parentLotCode);
  if (!parent) throw new Error('Lote padre no encontrado');
  if (parent.status === 'BLOCKED' || parent.status === 'QUARANTINE') throw new Error(`Lote padre en estado ${parent.status}`);

  const total = params.children.reduce((a, c) => a + Number(c.qty || 0), 0);
  if (total <= 0) throw new Error('Total inválido');
  if (total > parent.qty) throw new Error('No hay stock suficiente en el padre');

  // descuenta stock del padre
  parent.qty = Number((parent.qty - total).toFixed(3));
  parent.events.unshift({
    id: `e-${Date.now()}`,
    at: new Date().toISOString(),
    type: 'SPLIT',
    by: params.by,
    note: params.note ?? `Split a ${params.children.length} hijo(s)`,
    meta: { total, uom: parent.uom },
  });

  // crea hijos + links
  for (const ch of params.children) {
    const childLot: Lot = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      code: ch.code,
      type: (ch.type ?? parent.type) as LotType,
      itemCode: ch.itemCode ?? parent.itemCode,
      description: ch.description ?? parent.description,
      qty: Number(ch.qty || 0),
      uom: ch.uom ?? parent.uom,
      status: 'AVAILABLE',
      location: ch.location ?? parent.location,
      createdAt: new Date().toISOString().slice(0, 10),
      properties: [],
      events: [
        { id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'CREATED', by: params.by, note: 'Lote hijo creado por split' },
      ],
    };

    this.lots.unshift(childLot);

    this.createLink({
      type: 'SPLIT',
      parentLotCode: parent.code,
      childLotCode: childLot.code,
      qty: childLot.qty,
      uom: childLot.uom,
      by: params.by,
      note: params.note,
    });

    childLot.events.unshift({
      id: `e-${Date.now()}`,
      at: new Date().toISOString(),
      type: 'NOTE',
      by: params.by,
      note: `Origen: ${parent.code} (split)`,
    });
  }

  return parent;
}

mergeLots(params: {
  childLotCode: string; // lote resultado
  parents: { code: string; qty: number }[];
  by: string;
  note?: string;
  location?: string;
  type?: LotType;
  itemCode?: string;
  description?: string;
  uom?: string;
}) {
  if (!params.childLotCode) throw new Error('Código del lote resultado requerido');
  if (!params.parents?.length) throw new Error('Debes indicar padres');

  // valida padres y descuenta
  let uom = params.uom ?? '';
  let total = 0;

  for (const p of params.parents) {
    const lot = this.findLotByCode(p.code);
    if (!lot) throw new Error(`Padre no encontrado: ${p.code}`);
    if (lot.status === 'BLOCKED' || lot.status === 'QUARANTINE') throw new Error(`Padre ${p.code} en estado ${lot.status}`);
    if (p.qty <= 0) throw new Error('Qty inválida en padres');
    if (p.qty > lot.qty) throw new Error(`Stock insuficiente en ${p.code}`);

    if (!uom) uom = lot.uom;
    if (lot.uom !== uom) throw new Error('No puedes mezclar UoM distintas (por ahora)');
    total += Number(p.qty);
  }

  // crear/actualizar lote resultado
  let child = this.findLotByCode(params.childLotCode);
  if (!child) {
    child = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      code: params.childLotCode,
      type: (params.type ?? 'WIP') as LotType,
      itemCode: params.itemCode ?? 'MIX',
      description: params.description ?? 'Mezcla / Merge',
      qty: 0,
      uom,
      status: 'AVAILABLE',
      location: params.location ?? 'ALM-01',
      createdAt: new Date().toISOString().slice(0, 10),
      properties: [],
      events: [{ id: `e-${Date.now()}`, at: new Date().toISOString(), type: 'CREATED', by: params.by, note: 'Lote creado por merge' }],
    };
    this.lots.unshift(child);
  }

  // descuenta padres + links
  for (const p of params.parents) {
    const parent = this.findLotByCode(p.code)!;
    parent.qty = Number((parent.qty - p.qty).toFixed(3));
    parent.events.unshift({
      id: `e-${Date.now()}`,
      at: new Date().toISOString(),
      type: 'MERGED',
      by: params.by,
      note: params.note ?? `Merge hacia ${child.code}`,
      meta: { to: child.code, qty: p.qty, uom },
    });

    this.createLink({
      type: 'MERGE',
      parentLotCode: parent.code,
      childLotCode: child.code,
      qty: p.qty,
      uom,
      by: params.by,
      note: params.note,
    });
  }

  child.qty = Number((child.qty + total).toFixed(3));
  child.location = params.location ?? child.location;
  child.events.unshift({
    id: `e-${Date.now()}`,
    at: new Date().toISOString(),
    type: 'MERGED',
    by: params.by,
    note: params.note ?? 'Merge recibido',
    meta: { fromCount: params.parents.length, total, uom },
  });

  return child;
}



serialsByLot(lotCode: string) {
  return this.serials.filter(s => s.lotCode === lotCode);
}


locations: WarehouseLocation[] = [
  { id: 'loc1', code: 'ALM-01/RECEP', zone: 'ALM-01', area: 'RECEP' },
  { id: 'loc2', code: 'ALM-01/R1/N1', zone: 'ALM-01', area: 'MP', rack: 'R1', level: 'N1' },
  { id: 'loc3', code: 'ALM-01/R1/N2', zone: 'ALM-01', area: 'MP', rack: 'R1', level: 'N2' },
  { id: 'loc4', code: 'ALM-PT/R1/N1', zone: 'ALM-PT', area: 'PT', rack: 'R1', level: 'N1' },
  { id: 'loc5', code: 'ALM-PT/QC', zone: 'ALM-PT', area: 'QC' },
  { id: 'loc6', code: 'PLANTA/HIL-01', zone: 'PLANTA', area: 'PROD' },
  { id: 'loc7', code: 'PLANTA/BOB-01', zone: 'PLANTA', area: 'PROD' },
];

getZones() {
  return Array.from(new Set(this.locations.map(l => l.zone))).sort();
}

getAreas(zone?: string) {
  const arr = zone ? this.locations.filter(l => l.zone === zone) : this.locations;
  return Array.from(new Set(arr.map(l => l.area))).sort();
}

getLocations(zone?: string, area?: string) {
  return this.locations.filter(l => {
    if (zone && l.zone !== zone) return false;
    if (area && l.area !== area) return false;
    return true;
  });
}

getLotsInLocation(locationCode: string) {
  return this.lots.filter(l => l.location === locationCode);
}

getSerialsInLocation(locationCode: string) {
  return this.serials.filter(s => s.location === locationCode);
}




}
