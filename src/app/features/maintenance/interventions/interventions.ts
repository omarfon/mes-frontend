import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService, Intervention, InterventionStatus } from '../services/maintenance-store.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-interventions',
  imports: [CommonModule, FormsModule],
  templateUrl: './interventions.html',
})
export class InterventionsComponent {
  q = '';
  selected: Intervention | null = null;
  error = '';
  success = '';

  form = {
    assetCode: 'MAQ-001',
    woId: '',
    technician: 'técnico1',
    status: 'PLANNED' as InterventionStatus,
    startAt: '',
    endAt: '',
    downtimeMinutes: 0,
    summary: '',
    rootCause: '',
    actions: '',
    usedSpareCode: 'REP-001',
    usedSpareQty: 1,
    notes: '',
  };

  constructor(public ms: MaintenanceStoreService, private route: ActivatedRoute, private router: Router) {}

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.ms.interventions.filter(i => {
      if (!t) return true;
      return [i.code, i.assetCode, i.assetName, i.location, i.status, i.technician, i.woId ?? '', i.summary ?? '']
        .join(' ')
        .toLowerCase()
        .includes(t);
    });
  }

  open(i: Intervention) {
    this.selected = i;
    this.error=''; this.success='';
  }

  create() {
    this.error=''; this.success='';
    try {
      const it = this.ms.addIntervention({
        woId: this.form.woId.trim() || undefined,
        assetCode: this.form.assetCode,
        technician: this.form.technician.trim() || 'técnico',
        status: this.form.status,
        startAt: this.form.startAt ? new Date(this.form.startAt).toISOString() : undefined,
        endAt: this.form.endAt ? new Date(this.form.endAt).toISOString() : undefined,
        downtimeMinutes: Number(this.form.downtimeMinutes || 0),
        summary: this.form.summary.trim() || undefined,
        rootCause: this.form.rootCause.trim() || undefined,
        actions: this.form.actions.trim() || undefined,
        usedSpares: this.form.usedSpareCode.trim()
          ? [{ spareCode: this.form.usedSpareCode.trim(), qty: Number(this.form.usedSpareQty || 0) }]
          : [],
        notes: this.form.notes.trim() || undefined,
      });

      // (opcional pro) si usó repuesto => registrar salida de inventario
      if (it.usedSpares.length) {
        const u = it.usedSpares[0];
        if (u.qty > 0) {
          try {
            this.ms.applyInventoryTxn({
              type: 'OUT',
              spareCode: u.spareCode,
              qty: u.qty,
              ref: it.woId || it.code,
              by: it.technician,
              note: 'Consumo por intervención',
            });
          } catch {}
        }
      }

      this.success = `Intervención creada: ${it.code}`;
      this.open(it);
    } catch (e:any) {
      this.error = e?.message ?? 'Error creando intervención';
    }
  }

  setStatus(st: InterventionStatus) {
    if (!this.selected) return;
    this.error=''; this.success='';
    try {
      this.ms.setInterventionStatus(this.selected.id, st);
      this.success = `Estado: ${st}`;
    } catch (e:any) {
      this.error = e?.message ?? 'Error estado';
    }
  }

  badge(st: InterventionStatus) {
    if (st === 'PLANNED') return 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-1 text-[11px]';
    if (st === 'IN_PROGRESS') return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
    return 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 rounded-full px-2 py-1 text-[11px]';
  }

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    const it = this.ms.findIntervention(id);
    if (it) this.open(it);
  }
}

goWo() {
  if (!this.selected?.woId) return;
  this.router.navigate(['/maintenance/work-orders', this.selected.woId]);
}
}
