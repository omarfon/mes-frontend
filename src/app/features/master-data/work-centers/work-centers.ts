import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkCentersService, WorkCenter, WorkCenterType, CreateWorkCenterDto } from './work-centers.service';

@Component({
  standalone: true,
  selector: 'app-work-centers',
  imports: [CommonModule, FormsModule],
  templateUrl: './work-centers.html',
})
export class WorkCentersComponent implements OnInit {
  form: CreateWorkCenterDto = {
    code: '', name: '', areaCode: '', type: 'LINE',
    capacityPcsPerHour: null, description: '', active: true,
  };

  items: WorkCenter[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  readonly wcTypes: { value: WorkCenterType; label: string }[] = [
    { value: 'LINE', label: 'Línea de producción' },
    { value: 'CELL', label: 'Celda de trabajo' },
    { value: 'WORK_CENTER', label: 'Centro de trabajo' },
  ];

  constructor(private svc: WorkCentersService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.areaCode, x.type, x.description].some(v => v.toLowerCase().includes(t))
    );
  }

  typeLabel(type: WorkCenterType): string {
    return this.wcTypes.find(t => t.value === type)?.label ?? type;
  }

  typeBadge(type: WorkCenterType): string {
    const map: Record<string, string> = {
      LINE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      CELL: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      WORK_CENTER: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
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

  edit(it: WorkCenter) {
    this.editingId = it.id;
    this.form = {
      code: it.code, name: it.name, areaCode: it.areaCode, type: it.type,
      capacityPcsPerHour: it.capacityPcsPerHour, description: it.description, active: it.active,
    };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este centro de trabajo?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', areaCode: '', type: 'LINE', capacityPcsPerHour: null, description: '', active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un registro con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}

