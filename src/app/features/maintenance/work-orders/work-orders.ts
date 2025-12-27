import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MaintenanceStoreService,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderType,
} from '../services/maintenance-store.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-work-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './work-orders.html',
})
export class WorkOrdersComponent {
  view: 'LIST' | 'KANBAN' = 'KANBAN';
  q = '';
  filterStatus: 'ALL' | WorkOrderStatus = 'ALL';
  filterPriority: 'ALL' | WorkOrderPriority = 'ALL';

  selected: WorkOrder | null = null;
  error = '';
  success = '';

  // nuevo WO
  form = {
    type: 'CORRECTIVE' as WorkOrderType,
    priority: 'MEDIUM' as WorkOrderPriority,
    status: 'OPEN' as WorkOrderStatus,

    assetCode: 'MAQ-001',
    title: '',
    description: '',
    requestedBy: 'producción',
    assignedTo: '',
    scheduledAt: '',
    dueAt: '',
    tags: 'mecánico',
  };

  // logs/spares/evidence
  logStart = '';
  logEnd = '';
  logTech = '';
  logNote = '';

  spareCode = 'REP-001';
  spareName = '';
  spareQty = 1;
  spareUom = 'und';

  evBy = 'técnico';
  evNote = '';


  constructor(public ms: MaintenanceStoreService, private route: ActivatedRoute, private router: Router) {}

 

  clearMsg() { this.error = ''; this.success = ''; }

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.ms.workOrders.filter(w => {
      if (this.filterStatus !== 'ALL' && w.status !== this.filterStatus) return false;
      if (this.filterPriority !== 'ALL' && w.priority !== this.filterPriority) return false;
      if (!t) return true;
      const hay = [w.code, w.title, w.assetCode, w.assetName, w.location, w.type, w.priority, w.status, w.requestedBy, w.assignedTo ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(t);
    });
  }

  byStatus(st: WorkOrderStatus) {
    return this.list.filter(w => w.status === st);
  }

  open(w: WorkOrder) {
    this.selected = w;
    this.clearMsg();
    this.logTech = w.assignedTo ?? '';
  }

  create() {
    this.clearMsg();

    const asset = this.ms.assets.find(a => a.code === this.form.assetCode);
    if (!asset) { this.error = 'Activo no encontrado'; return; }
    if (!this.form.title.trim()) { this.error = 'Título requerido'; return; }

    const wo = this.ms.addWo({
      type: this.form.type,
      priority: this.form.priority,
      status: this.form.status,
      assetCode: asset.code,
      assetName: asset.name,
      location: asset.location,
      title: this.form.title.trim(),
      description: this.form.description?.trim(),
      requestedBy: this.form.requestedBy.trim() || 'producción',
      assignedTo: this.form.assignedTo.trim() || undefined,
      scheduledAt: this.form.scheduledAt || undefined,
      dueAt: this.form.dueAt || undefined,
      tags: this.form.tags.split(',').map(x => x.trim()).filter(Boolean),
    });

    this.success = `WO creada: ${wo.code}`;
    this.form.title = '';
    this.form.description = '';
    this.open(wo);
  }

  setStatus(w: WorkOrder, st: WorkOrderStatus) {
    this.clearMsg();
    try {
      this.ms.setStatus(w.id, st);
      this.success = `Estado: ${st}`;
    } catch (e: any) {
      this.error = e?.message ?? 'Error cambiando estado';
    }
  }

  addLog() {
    this.clearMsg();
    if (!this.selected) return;

    if (!this.logStart) { this.error = 'startAt requerido'; return; }
    const tech = this.logTech.trim() || (this.selected.assignedTo ?? 'técnico');
    const startIso = new Date(this.logStart).toISOString();
    const endIso = this.logEnd ? new Date(this.logEnd).toISOString() : undefined;

    try {
      this.ms.addTimeLog(this.selected.id, { technician: tech, startAt: startIso, endAt: endIso, note: this.logNote.trim() || undefined });
      this.success = 'Tiempo registrado';
      this.logEnd = '';
      this.logNote = '';
    } catch (e: any) {
      this.error = e?.message ?? 'Error log';
    }
  }

 addSpare() {
  this.clearMsg();
  if (!this.selected) return;

  const spare = this.ms.spareByCode(this.spareCode);
  if (!spare) { this.error = 'Repuesto no encontrado'; return; }

  try {
    this.ms.addSpare(this.selected.id, {
      code: spare.code,
      name: spare.name,
      qty: Number(this.spareQty || 0),
      uom: spare.uom,
    });
    this.success = 'Repuesto consumido (OUT) y agregado a la WO';
    this.spareQty = 1;
  } catch (e: any) {
    this.error = e?.message ?? 'Error consumiendo repuesto';
  }
}

  addEvidence() {
    this.clearMsg();
    if (!this.selected) return;
    if (!this.evNote.trim()) { this.error = 'Escribe una nota de evidencia'; return; }

    try {
      this.ms.addEvidence(this.selected.id, { by: this.evBy.trim() || 'técnico', note: this.evNote.trim() });
      this.success = 'Evidencia registrada';
      this.evNote = '';
    } catch (e: any) {
      this.error = e?.message ?? 'Error evidencia';
    }
  }

  badgePriority(p: WorkOrderPriority) {
    switch (p) {
      case 'LOW': return 'bg-slate-500/10 text-slate-200 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'HIGH': return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-200 border border-rose-500/20 rounded-full px-2 py-1 text-[11px]';
    }
  }

  badgeStatus(s: WorkOrderStatus) {
    switch (s) {
      case 'OPEN': return 'ui-badge';
      case 'PLANNED': return 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'ON_HOLD': return 'bg-slate-500/10 text-slate-200 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
      case 'DONE': return 'ui-badge-ok';
      case 'CLOSED': return 'ui-badge-ok';
      case 'CANCELLED': return 'ui-badge-bad';
    }
  }

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    const wo = this.ms.findWo(id);
    if (wo) this.open(wo);
  }
}

goIntervention() {
  if (!this.selected) return;
  const it = this.ms.interventions.find(x => x.woId === this.selected!.id);
  if (!it) {
    const created = this.ms.ensureInterventionForWo(this.selected.id);
    this.router.navigate(['/maintenance/interventions', created.id]);
    return;
  }
  this.router.navigate(['/maintenance/interventions', it.id]);
}

goDowntime() {
  if (!this.selected) return;
  const dt = this.ms.downtimes.find(d => d.woId === this.selected!.id);
  if (!dt) { this.error = 'Esta WO no tiene parada vinculada'; return; }
  this.router.navigate(['/maintenance/downtime', dt.id]);
}

}
