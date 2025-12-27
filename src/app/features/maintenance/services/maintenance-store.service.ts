import { Injectable } from '@angular/core';
import { Asset } from '../assets/assets';


export type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'INSPECTION' | 'CALIBRATION';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WorkOrderStatus = 'OPEN' | 'PLANNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'DONE' | 'CLOSED' | 'CANCELLED';

export interface WoTimeLog {
  id: string;
  technician: string;
  startAt: string;     // ISO
  endAt?: string;      // ISO
  minutes?: number;
  note?: string;
}

export interface WoSpare {
  id: string;
  code: string;
  name: string;
  qty: number;
  uom: string;
}

export interface WoEvidence {
  id: string;
  at: string;          // ISO
  by: string;
  note?: string;
  fileName?: string;   // placeholder
}

export interface WorkOrder {
  id: string;
  code: string;              // WO-0001
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;

  assetCode: string;         // MAQ-001
  assetName: string;         // Hiladora 01
  location: string;          // PLANTA/HIL-01

  title: string;
  description?: string;

  requestedBy: string;
  assignedTo?: string;       // técnico
  scheduledAt?: string;      // ISO date-time
  dueAt?: string;            // ISO date-time

  createdAt: string;         // ISO
  closedAt?: string;         // ISO

  cause?: string;            // causa raíz
  actionTaken?: string;      // acción ejecutada
  downtimeMinutes?: number;  // parada

  tags: string[];
  spares: WoSpare[];
  timeLogs: WoTimeLog[];
  evidences: WoEvidence[];
}

export type DowntimeReason =
  | 'MECHANICAL'
  | 'ELECTRICAL'
  | 'SETUP'
  | 'QUALITY'
  | 'MATERIAL'
  | 'SAFETY'
  | 'PLANNED'
  | 'OTHER';

export interface DowntimeEvent {
  id: string;
  code: string;            // DT-0001
  assetCode: string;
  assetName: string;
  location: string;

  startAt: string;         // ISO
  endAt?: string;          // ISO
  minutes?: number;        // calculado
  reason: DowntimeReason;

  woId?: string;           // link a work order
  reportedBy: string;
  notes?: string;
}

export type PmFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

export interface MaintenancePlan {
  id: string;
  code: string;           // PM-0001
  name: string;
  assetCode: string;
  assetName: string;
  location: string;

  frequency: PmFrequency;
  estimatedMinutes: number;

  nextAt: string;         // ISO date-time (próxima ejecución)
  active: boolean;

  checklist: { id: string; task: string; mandatory: boolean }[];
}

export interface CalendarItem {
  id: string;
  type: 'PM' | 'WO';
  title: string;
  at: string;             // ISO date-time
  assetCode: string;
  location: string;
  refId: string;          // planId o woId
}

export type InventoryTxnType = 'IN' | 'OUT' | 'ADJUST';
export interface SparePart {
  id: string;
  code: string;       // REP-001
  name: string;
  uom: string;        // und
  minStock: number;
  stock: number;
  location?: string;  // almacén/estante
  unitCost?: number;  // opcional
  isActive: boolean;
}

export interface InventoryTxn {
  id: string;
  at: string;         // ISO
  type: InventoryTxnType;
  spareCode: string;
  qty: number;
  ref?: string;       // WO-0001 o ajuste
  by: string;
  note?: string;
}

export type InterventionStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE';
export interface Intervention {
  id: string;
  code: string;         // INT-0001
  woId?: string;        // si proviene de WO
  assetCode: string;
  assetName: string;
  location: string;

  startAt?: string;     // ISO
  endAt?: string;       // ISO
  status: InterventionStatus;

  technician: string;
  summary?: string;
  rootCause?: string;
  actions?: string;
  downtimeMinutes?: number;

  usedSpares: { spareCode: string; qty: number }[];
  notes?: string;
}


@Injectable({ providedIn: 'root' })
export class MaintenanceStoreService {
  // demo assets (luego lo conectamos a Maestros/Machines)
assets: Asset[] = [
    {
      id: 'asset1',
      code: 'MAQ-001',
      name: 'Hiladora 01',
      category: 'MACHINERY',
      manufacturer: 'Fabricante A',
      model: 'H-100',
      serialNumber: 'SN-HIL-001',
      location: 'PLANTA/HIL-01',
      status: 'OPERATIONAL',
      installDate: '2020-01-15',
      warrantyEndDate: '2025-01-15',
      criticality: 'HIGH',
      createdAt: new Date('2020-01-15').toISOString()
    },
    {
      id: 'asset2',
      code: 'MAQ-002',
      name: 'Bobinadora 01',
      category: 'MACHINERY',
      manufacturer: 'Fabricante B',
      model: 'B-200',
      serialNumber: 'SN-BOB-002',
      location: 'PLANTA/BOB-01',
      status: 'OPERATIONAL',
      installDate: '2020-03-20',
      warrantyEndDate: '2025-03-20',
      criticality: 'MEDIUM',
      createdAt: new Date('2020-03-20').toISOString()
    },
    {
      id: 'asset3',
      code: 'MAQ-003',
      name: 'Carda 01',
      category: 'MACHINERY',
      manufacturer: 'Fabricante C',
      model: 'C-300',
      serialNumber: 'SN-CAR-003',
      location: 'PLANTA/CAR-01',
      status: 'OPERATIONAL',
      installDate: '2020-02-10',
      warrantyEndDate: '2025-02-10',
      criticality: 'MEDIUM',
      createdAt: new Date('2020-02-10').toISOString()
    },
  ];


  workOrders: WorkOrder[] = [
    {
      id: 'wo1',
      code: 'WO-0001',
      type: 'CORRECTIVE',
      status: 'OPEN',
      priority: 'HIGH',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      location: 'PLANTA/HIL-01',
      title: 'Vibración anormal en cabezal',
      description: 'Se reporta vibración y ruido intermitente. Revisar rodamientos.',
      requestedBy: 'producción',
      assignedTo: 'técnico1',
      createdAt: new Date().toISOString(),
      tags: ['mecánico'],
      spares: [],
      timeLogs: [],
      evidences: [],
    },
    {
      id: 'wo2',
      code: 'WO-0002',
      type: 'PREVENTIVE',
      status: 'PLANNED',
      priority: 'MEDIUM',
      assetCode: 'MAQ-002',
      assetName: 'Bobinadora 01',
      location: 'PLANTA/BOB-01',
      title: 'PM mensual: lubricación y ajuste',
      description: 'Checklist PM mensual.',
      requestedBy: 'mantenimiento',
      assignedTo: 'técnico2',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      tags: ['pm'],
      spares: [],
      timeLogs: [],
      evidences: [],
    },
  ];

  downtimes: DowntimeEvent[] = [
  {
    id: 'dt1',
    code: 'DT-0001',
    assetCode: 'MAQ-001',
    assetName: 'Hiladora 01',
    location: 'PLANTA/HIL-01',
    startAt: new Date(Date.now() - 90 * 60000).toISOString(),
    endAt: new Date(Date.now() - 30 * 60000).toISOString(),
    minutes: 60,
    reason: 'MECHANICAL',
    reportedBy: 'producción',
    notes: 'Ruido/vibración, se detuvo por seguridad',
  },
];

plans: MaintenancePlan[] = [
  {
    id: 'pm1',
    code: 'PM-0001',
    name: 'PM mensual: lubricación + ajuste',
    assetCode: 'MAQ-002',
    assetName: 'Bobinadora 01',
    location: 'PLANTA/BOB-01',
    frequency: 'MONTHLY',
    estimatedMinutes: 90,
    nextAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    active: true,
    checklist: [
      { id: 'c1', task: 'Lubricar rodamientos', mandatory: true },
      { id: 'c2', task: 'Revisar tensión de correas', mandatory: true },
      { id: 'c3', task: 'Limpieza general', mandatory: false },
    ],
  },
];

spares: SparePart[] = [
  { id: 'sp1', code: 'REP-001', name: 'Rodamiento 6205', uom: 'und', minStock: 10, stock: 24, location: 'ALM-A/EST-01', unitCost: 18, isActive: true },
  { id: 'sp2', code: 'REP-002', name: 'Correa A-42', uom: 'und', minStock: 6, stock: 4, location: 'ALM-A/EST-02', unitCost: 12, isActive: true },
  { id: 'sp3', code: 'REP-003', name: 'Grasa industrial', uom: 'kg', minStock: 5, stock: 12, location: 'ALM-B/EST-03', unitCost: 25, isActive: true },
];

inventoryTxns: InventoryTxn[] = [
  { id: 'tx1', at: new Date().toISOString(), type: 'IN', spareCode: 'REP-001', qty: 10, ref: 'Compra', by: 'almacén', note: 'Ingreso inicial' },
  { id: 'tx2', at: new Date().toISOString(), type: 'OUT', spareCode: 'REP-002', qty: 2, ref: 'WO-0001', by: 'técnico1', note: 'Cambio de correa' },
];

interventions: Intervention[] = [
  {
    id: 'int1',
    code: 'INT-0001',
    woId: 'wo1',
    assetCode: 'MAQ-001',
    assetName: 'Hiladora 01',
    location: 'PLANTA/HIL-01',
    status: 'IN_PROGRESS',
    technician: 'técnico1',
    startAt: new Date(Date.now() - 45 * 60000).toISOString(),
    usedSpares: [{ spareCode: 'REP-001', qty: 1 }],
    notes: 'Revisión de rodamientos',
  },
];


nextDtCode() {
  const n = this.downtimes.length + 1;
  return `DT-${String(n).padStart(4, '0')}`;
}

nextPmCode() {
  const n = this.plans.length + 1;
  return `PM-${String(n).padStart(4, '0')}`;
}

calcMinutes(startAtIso: string, endAtIso?: string) {
  const start = new Date(startAtIso).getTime();
  const end = endAtIso ? new Date(endAtIso).getTime() : Date.now();
  return Math.max(0, Math.round((end - start) / 60000));
}

addDowntime(payload: Omit<DowntimeEvent, 'id' | 'code' | 'assetName' | 'location' | 'minutes'>) {
  const asset = this.assets.find(a => a.code === payload.assetCode);
  if (!asset) throw new Error('Activo no encontrado');

  const dt: DowntimeEvent = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    code: this.nextDtCode(),
    assetCode: asset.code,
    assetName: asset.name,
    location: asset.location,
    startAt: payload.startAt,
    endAt: payload.endAt,
    minutes: this.calcMinutes(payload.startAt, payload.endAt),
    reason: payload.reason,
    woId: payload.woId,
    reportedBy: payload.reportedBy,
    notes: payload.notes,
  };
  this.downtimes.unshift(dt);
  return dt;
}

closeDowntime(id: string, endAtIso: string) {
  const dt = this.downtimes.find(d => d.id === id);
  if (!dt) throw new Error('Parada no encontrada');
  dt.endAt = endAtIso;
  dt.minutes = this.calcMinutes(dt.startAt, dt.endAt);
  return dt;
}

addPlan(payload: Omit<MaintenancePlan, 'id' | 'code' | 'assetName' | 'location' | 'checklist'> & { checklist?: MaintenancePlan['checklist'] }) {
  const asset = this.assets.find(a => a.code === payload.assetCode);
  if (!asset) throw new Error('Activo no encontrado');

  const plan: MaintenancePlan = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    code: this.nextPmCode(),
    name: payload.name,
    assetCode: asset.code,
    assetName: asset.name,
    location: asset.location,
    frequency: payload.frequency,
    estimatedMinutes: payload.estimatedMinutes,
    nextAt: payload.nextAt,
    active: payload.active,
    checklist: payload.checklist ?? [],
  };
  this.plans.unshift(plan);
  return plan;
}

calendarItemsBetween(fromIso: string, toIso: string): CalendarItem[] {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();

  const pmItems: CalendarItem[] = this.plans
    .filter(p => p.active)
    .map(p => ({
      id: `cal-pm-${p.id}`,
      type: 'PM' as const,
      title: `${p.code} · ${p.name}`,
      at: p.nextAt,
      assetCode: p.assetCode,
      location: p.location,
      refId: p.id,
    }))
    .filter(i => {
      const t = new Date(i.at).getTime();
      return t >= from && t <= to;
    });

  const woItems: CalendarItem[] = this.workOrders
    .filter(w => !!w.scheduledAt)
    .map(w => ({
      id: `cal-wo-${w.id}`,
      type: 'WO' as const,
      title: `${w.code} · ${w.title}`,
      at: w.scheduledAt!,
      assetCode: w.assetCode,
      location: w.location,
      refId: w.id,
    }))
    .filter(i => {
      const t = new Date(i.at).getTime();
      return t >= from && t <= to;
    });

  return [...pmItems, ...woItems].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

downtimeKpis() {
  const open = this.downtimes.filter(d => !d.endAt).length;
  const totalMin = this.downtimes.reduce((acc, d) => acc + (d.minutes ?? this.calcMinutes(d.startAt, d.endAt)), 0);
  const byReason = this.downtimes.reduce<Record<string, number>>((acc, d) => {
    const k = d.reason;
    acc[k] = (acc[k] ?? 0) + (d.minutes ?? 0);
    return acc;
  }, {});
  return { open, totalMin, byReason };
}


  nextCode(prefix: string) {
    const n = this.workOrders.length + 1;
    return `${prefix}-${String(n).padStart(4, '0')}`;
  } 

 setStatus(id: string, status: WorkOrderStatus) {
  const w = this.findWo(id);
  if (!w) throw new Error('WO no encontrada');

  w.status = status;

  // Si entra a ejecución => crea/asegura intervención
  if (status === 'IN_PROGRESS') {
    this.ensureInterventionForWo(w.id);
  }

  // Si termina => marca cierre + cierra paradas vinculadas + termina intervención
  if (status === 'DONE' || status === 'CLOSED') {
    w.closedAt = w.closedAt ?? new Date().toISOString();

    // cerrar DT si estaban abiertas y vinculadas a esta WO
    this.closeLinkedDowntimesForWo(w.id);

    // marcar intervención DONE si existe
    const it = this.interventions.find(x => x.woId === w.id);
    if (it && it.status !== 'DONE') {
      it.status = 'DONE';
      it.endAt = it.endAt ?? new Date().toISOString();
    }
  } else {
    w.closedAt = undefined;
  }

  return w;
}


  addWo(payload: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'tags' | 'spares' | 'timeLogs' | 'evidences'> & { tags?: string[] }) {
    const wo: WorkOrder = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      code: this.nextCode('WO'),
      createdAt: new Date().toISOString(),
      tags: payload.tags ?? [],
      spares: [],
      timeLogs: [],
      evidences: [],
      ...payload,
    };
    this.workOrders.unshift(wo);
    return wo;
  }

  addTimeLog(woId: string, log: Omit<WoTimeLog, 'id' | 'minutes'>) {
    const wo = this.findWo(woId);
    if (!wo) throw new Error('WO no encontrada');

    const start = new Date(log.startAt).getTime();
    const end = log.endAt ? new Date(log.endAt).getTime() : Date.now();
    const minutes = Math.max(0, Math.round((end - start) / 60000));

    const entry: WoTimeLog = { id: crypto.randomUUID?.() ?? String(Date.now()), ...log, minutes };
    wo.timeLogs.unshift(entry);
    return entry;
  }

  addSpare(woId: string, spare: Omit<WoSpare, 'id'>) {
  const wo = this.findWo(woId);
  if (!wo) throw new Error('WO no encontrada');

  // valida stock + descuenta inventario (OUT)
  this.consumeSpare(
    spare.code,
    spare.qty,
    wo.code,                   // ref
    wo.assignedTo ?? 'técnico'  // by
  );

  const entry: WoSpare = { id: crypto.randomUUID?.() ?? String(Date.now()), ...spare };
  wo.spares.unshift(entry);
  return entry;
}

  addEvidence(woId: string, ev: Omit<WoEvidence, 'id' | 'at'>) {
    const wo = this.findWo(woId);
    if (!wo) throw new Error('WO no encontrada');
    const entry: WoEvidence = { id: crypto.randomUUID?.() ?? String(Date.now()), at: new Date().toISOString(), ...ev };
    wo.evidences.unshift(entry);
    return entry;
  }

  kpis() {
    const open = this.workOrders.filter(w => ['OPEN','PLANNED','IN_PROGRESS','ON_HOLD'].includes(w.status)).length;
    const closed = this.workOrders.filter(w => ['DONE','CLOSED'].includes(w.status)).length;
    const critical = this.workOrders.filter(w => w.priority === 'CRITICAL' && w.status !== 'CLOSED').length;
    return { open, closed, critical };
  }

  nextInvCode(prefix: string) {
  const n = (this.inventoryTxns?.length ?? 0) + 1;
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

spareByCode(code: string) {
  return this.spares.find(s => s.code === code) ?? null;
}

applyInventoryTxn(tx: Omit<InventoryTxn, 'id' | 'at'>) {
  const spare = this.spareByCode(tx.spareCode);
  if (!spare) throw new Error('Repuesto no encontrado');

  const qty = Number(tx.qty || 0);
  if (qty <= 0) throw new Error('Cantidad inválida');

  if (tx.type === 'IN') spare.stock += qty;
  if (tx.type === 'OUT') spare.stock -= qty;
  if (tx.type === 'ADJUST') spare.stock = qty;

  const entry: InventoryTxn = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    at: new Date().toISOString(),
    ...tx,
  };
  this.inventoryTxns.unshift(entry);
  return entry;
}

inventoryKpis() {
  const low = this.spares.filter(s => s.isActive && s.stock <= s.minStock).length;
  const totalSkus = this.spares.filter(s => s.isActive).length;
  const stockValue = this.spares.reduce((acc, s) => acc + (s.unitCost ? s.unitCost * s.stock : 0), 0);
  return { low, totalSkus, stockValue };
}

nextInterventionCode() {
  const n = this.interventions.length + 1;
  return `INT-${String(n).padStart(4, '0')}`;
}

addIntervention(payload: Omit<Intervention, 'id' | 'code' | 'assetName' | 'location'>) {
  const asset = this.assets.find(a => a.code === payload.assetCode);
  if (!asset) throw new Error('Activo no encontrado');

  const it: Intervention = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    code: this.nextInterventionCode(),
    assetName: asset.name,
    location: asset.location,
    ...payload,
  };
  this.interventions.unshift(it);
  return it;
}

setInterventionStatus(id: string, status: InterventionStatus) {
  const it = this.interventions.find(x => x.id === id);
  if (!it) throw new Error('Intervención no encontrada');
  it.status = status;
  if (status === 'IN_PROGRESS' && !it.startAt) it.startAt = new Date().toISOString();
  if (status === 'DONE' && !it.endAt) it.endAt = new Date().toISOString();
  return it;
}

historyForAsset(assetCode: string) {
  const wos = this.workOrders.filter(w => w.assetCode === assetCode);
  const dts = this.downtimes.filter(d => d.assetCode === assetCode);
  const ints = this.interventions.filter(i => i.assetCode === assetCode);

  // ordenado por fecha más reciente (mezclado)
  const rows = [
    ...wos.map(w => ({ type: 'WO', at: w.createdAt, title: `${w.code} · ${w.title}`, meta: `${w.status} · ${w.priority}` })),
    ...ints.map(i => ({ type: 'INT', at: i.startAt ?? i.endAt ?? new Date().toISOString(), title: `${i.code} · ${i.status}`, meta: `${i.technician}` })),
    ...dts.map(d => ({ type: 'DT', at: d.startAt, title: `${d.code} · ${d.reason}`, meta: `${d.minutes ?? 0} min` })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return { wos, dts, ints, rows };
}
// --- Finders ---
findWo(id: string) {
  return this.workOrders.find(w => w.id === id) ?? null;
}
findWoByCode(code: string) {
  return this.workOrders.find(w => w.code === code) ?? null;
}
findDowntime(id: string) {
  return this.downtimes.find(d => d.id === id) ?? null;
}
findIntervention(id: string) {
  return this.interventions.find(i => i.id === id) ?? null;
}

// --- Link helpers ---
linkDowntimeToWo(downtimeId: string, woId: string) {
  const dt = this.findDowntime(downtimeId);
  const wo = this.findWo(woId);
  if (!dt || !wo) throw new Error('DT/WO no encontrado');
  dt.woId = wo.id; // guardamos id
  return dt;
}

ensureInterventionForWo(woId: string) {
  const wo = this.findWo(woId);
  if (!wo) throw new Error('WO no encontrada');

  let it = this.interventions.find(x => x.woId === wo.id) ?? null;
  if (it) return it;

  it = this.addIntervention({
    woId: wo.id,
    assetCode: wo.assetCode,
    technician: wo.assignedTo ?? 'técnico',
    status: wo.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PLANNED',
    startAt: wo.status === 'IN_PROGRESS' ? new Date().toISOString() : undefined,
    endAt: undefined,
    downtimeMinutes: 0,
    summary: undefined,
    rootCause: undefined,
    actions: undefined,
    usedSpares: [],
    notes: `Generada desde ${wo.code}`,
  });

  return it;
}

// --- Close DT when WO closes ---
closeLinkedDowntimesForWo(woId: string) {
  const nowIso = new Date().toISOString();
  const linked = this.downtimes.filter(d => d.woId === woId && !d.endAt);
  linked.forEach(d => {
    d.endAt = nowIso;
    d.minutes = this.calcMinutes(d.startAt, d.endAt);
  });
  return linked.length;
}

consumeSpare(spareCode: string, qty: number, ref: string, by: string) {
  const spare = this.spareByCode(spareCode);
  if (!spare) throw new Error('Repuesto no encontrado');

  const q = Number(qty || 0);
  if (q <= 0) throw new Error('Cantidad inválida');

  if (spare.stock < q) {
    throw new Error(`Stock insuficiente (${spare.stock} ${spare.uom}) para ${spare.code}`);
  }

  // registra OUT y baja stock
  this.applyInventoryTxn({
    type: 'OUT',
    spareCode,
    qty: q,
    ref,
    by,
    note: 'Consumo desde WO',
  });

  return spare;
}



}
