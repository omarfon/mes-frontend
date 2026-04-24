import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreasService, Area, AreaType, CreateAreaDto } from './areas.service';

@Component({
  standalone: true,
  selector: 'app-areas',
  imports: [CommonModule, FormsModule],
  templateUrl: './areas.html',
})
export class AreasComponent implements OnInit {
  form: CreateAreaDto = {
    code: '', name: '', plantCode: '', type: 'SPINNING', description: '', active: true,
  };

  items: Area[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  readonly areaTypes: { value: AreaType; label: string }[] = [
    { value: 'PREPARATION', label: 'Preparación' },
    { value: 'SPINNING', label: 'Hilatura' },
    { value: 'WEAVING', label: 'Tejido' },
    { value: 'DYEING', label: 'Tintorería / Tintura' },
    { value: 'FINISHING', label: 'Acabados' },
    { value: 'QUALITY', label: 'Control de Calidad' },
    { value: 'WAREHOUSE', label: 'Almacén / WIP' },
    { value: 'MAINTENANCE', label: 'Mantenimiento' },
    { value: 'OTHER', label: 'Otro' },
  ];

  constructor(private svc: AreasService, private cdr: ChangeDetectorRef) {}

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
      [x.code, x.name, x.plantCode, x.type, x.description].some(v => v.toLowerCase().includes(t))
    );
  }

  typeLabel(type: AreaType): string {
    return this.areaTypes.find(t => t.value === type)?.label ?? type;
  }

  typeBadgeClass(type: AreaType): string {
    const map: Record<string, string> = {
      PREPARATION: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      SPINNING: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      WEAVING: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      DYEING: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      FINISHING: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      QUALITY: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      WAREHOUSE: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      MAINTENANCE: 'bg-red-500/10 text-red-300 border-red-500/20',
      OTHER: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ' + (map[type] ?? map['OTHER']);
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

  edit(it: Area) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, plantCode: it.plantCode, type: it.type, description: it.description, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta área?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', plantCode: '', type: 'SPINNING', description: '', active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un registro con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}

