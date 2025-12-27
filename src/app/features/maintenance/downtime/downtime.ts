import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService, DowntimeReason, DowntimeEvent } from '../services/maintenance-store.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-downtime',
  imports: [CommonModule, FormsModule],
  templateUrl: './downtime.html',
})
export class DowntimeComponent {
  q = '';
  selected: DowntimeEvent | null = null;
  error = '';
  success = '';

  reasons: DowntimeReason[] = ['MECHANICAL','ELECTRICAL','SETUP','QUALITY','MATERIAL','SAFETY','PLANNED','OTHER'];

  form = {
    assetCode: 'MAQ-001',
    startAt: '',
    endAt: '',
    reason: 'MECHANICAL' as DowntimeReason,
    reportedBy: 'producción',
    woId: '',
    notes: '',
  };

  closeEndAt = '';

  constructor(public ms: MaintenanceStoreService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    const dt = this.ms.findDowntime(id);
    if (dt) this.open(dt);
  }
}
  

  clearMsg(){ this.error=''; this.success=''; }

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.ms.downtimes.filter(d => {
      if (!t) return true;
      return [d.code, d.assetCode, d.assetName, d.location, d.reason, d.reportedBy, d.woId ?? '', d.notes ?? '']
        .join(' ')
        .toLowerCase()
        .includes(t);
    });
  }

  open(d: DowntimeEvent) {
    this.selected = d;
    this.clearMsg();
    this.closeEndAt = new Date().toISOString().slice(0,16); // datetime-local
  }

  create() {
    this.clearMsg();
    if (!this.form.startAt) { this.error = 'Start requerido'; return; }

    try {
      const startIso = new Date(this.form.startAt).toISOString();
      const endIso = this.form.endAt ? new Date(this.form.endAt).toISOString() : undefined;

      const dt = this.ms.addDowntime({
        assetCode: this.form.assetCode,
        startAt: startIso,
        endAt: endIso,
        reason: this.form.reason,
        reportedBy: this.form.reportedBy.trim() || 'producción',
        woId: this.form.woId.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
      });

      this.success = `Parada registrada: ${dt.code}`;
      this.form.endAt = '';
      this.form.notes = '';
      this.form.woId = '';
      this.open(dt);
    } catch (e: any) {
      this.error = e?.message ?? 'Error creando parada';
    }
  }

  closeSelected() {
    this.clearMsg();
    if (!this.selected) return;
    if (!this.closeEndAt) { this.error = 'End requerido'; return; }

    try {
      const endIso = new Date(this.closeEndAt).toISOString();
      this.ms.closeDowntime(this.selected.id, endIso);
      this.success = 'Parada cerrada';
    } catch (e: any) {
      this.error = e?.message ?? 'Error cerrando parada';
    }
  }

  badgeReason(r: DowntimeReason) {
    if (r === 'MECHANICAL' || r === 'ELECTRICAL') return 'bg-rose-500/10 text-rose-200 border border-rose-500/20 rounded-full px-2 py-1 text-[11px]';
    if (r === 'QUALITY' || r === 'MATERIAL') return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
    if (r === 'PLANNED' || r === 'SETUP') return 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-1 text-[11px]';
    return 'bg-slate-500/10 text-slate-200 border border-slate-500/20 rounded-full px-2 py-1 text-[11px]';
  }

  createWoFromDowntime() {
  this.clearMsg();
  if (!this.selected) return;

  // si ya tiene WO, navega
  if (this.selected.woId) {
    this.router.navigate(['/maintenance/work-orders', this.selected.woId]);
    return;
  }

  // crea WO rápida
  const dt = this.selected;
  const wo = this.ms.addWo({
    type: 'CORRECTIVE',
    priority: dt.reason === 'SAFETY' ? 'CRITICAL' : 'HIGH',
    status: 'OPEN',
    assetCode: dt.assetCode,
    assetName: dt.assetName,
    location: dt.location,
    title: `Parada ${dt.code} · ${dt.reason}`,
    description: dt.notes ?? `Generada desde parada ${dt.code}`,
    requestedBy: dt.reportedBy ?? 'producción',
    assignedTo: undefined,
    scheduledAt: undefined,
    dueAt: undefined,
    tags: ['downtime', dt.reason.toLowerCase()],
  });

  // vincula DT ↔ WO
  this.ms.linkDowntimeToWo(dt.id, wo.id);

  this.success = `WO creada y vinculada: ${wo.code}`;
  this.router.navigate(['/maintenance/work-orders', wo.id]);
}

goToWo() {
  if (!this.selected?.woId) return;
  this.router.navigate(['/maintenance/work-orders', this.selected.woId]);
}

}
