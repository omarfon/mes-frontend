import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkstationsService, Workstation, WorkstationType, CreateWorkstationDto } from './workstations.service';

@Component({
  standalone: true,
  selector: 'app-workstations',
  imports: [CommonModule, FormsModule],
  templateUrl: './workstations.html',
})
export class WorkstationsComponent implements OnInit {
  form: CreateWorkstationDto = {
    code: '', name: '', workCenterCode: '', type: 'MANUAL',
    asset: '', operatorSlots: 1, active: true,
  };

  items: Workstation[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: WorkstationsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  readonly wsTypes: { value: WorkstationType; label: string }[] = [
    { value: 'MANUAL', label: 'Manual' },
    { value: 'SEMI_AUTO', label: 'Semi-automático' },
    { value: 'AUTOMATED', label: 'Automatizado' },
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.workCenterCode, x.asset].some(v => v.toLowerCase().includes(t))
    );
  }

  typeLabel(type: WorkstationType): string {
    return this.wsTypes.find(t => t.value === type)?.label ?? type;
  }

  typeBadge(type: WorkstationType): string {
    const map: Record<string, string> = {
      MANUAL: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      SEMI_AUTO: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      AUTOMATED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    };
    return 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ' + (map[type] ?? '');
  }

  submit() {
    if (!this.form.code || !this.form.name) return;
    this.loading = true;
    const obs = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Workstation) {
    this.editingId = it.id;
    this.form = {
      code: it.code, name: it.name, workCenterCode: it.workCenterCode,
      type: it.type, asset: it.asset, operatorSlots: it.operatorSlots, active: it.active,
    };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta estación?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', workCenterCode: '', type: 'MANUAL', asset: '', operatorSlots: 1, active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un registro con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
