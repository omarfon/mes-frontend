import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementTypesService, MovementType, MovCategory, MovDirection, CreateMovementTypeDto } from './movement-types.service';

@Component({
  standalone: true,
  selector: 'app-movement-types',
  imports: [CommonModule, FormsModule],
  templateUrl: './movement-types.html',
})
export class MovementTypesComponent implements OnInit {
  form: CreateMovementTypeDto = {
    code: '', name: '', category: 'CONSUMPTION', direction: 'OUT',
    affectsStock: true, requiresLot: false, requiresReason: false, autoConsumed: false, active: true, notes: '',
  };

  items: MovementType[] = [];
  editingId: string | null = null;
  q = '';
  filterCategory: MovCategory | '' = '';
  loading = false;
  error: string | null = null;

  readonly categories: { value: MovCategory; label: string; cls: string }[] = [
    { value: 'CONSUMPTION', label: 'Consumo', cls: 'bg-blue-500/10 text-blue-300 border border-blue-500/30' },
    { value: 'SCRAP', label: 'Merma', cls: 'bg-red-500/10 text-red-400 border border-red-500/30' },
    { value: 'TRANSFER', label: 'Transferencia', cls: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' },
    { value: 'RETURN', label: 'Devolución', cls: 'bg-amber-500/10 text-amber-300 border border-amber-500/30' },
    { value: 'ADJUSTMENT', label: 'Ajuste', cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30' },
    { value: 'RECEIPT', label: 'Recepción', cls: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' },
  ];

  readonly directions: { value: MovDirection; label: string; cls: string }[] = [
    { value: 'IN', label: 'Entrada', cls: 'text-emerald-400' },
    { value: 'OUT', label: 'Salida', cls: 'text-red-400' },
    { value: 'TRANSFER', label: 'Transferencia', cls: 'text-indigo-300' },
  ];

  constructor(private svc: MovementTypesService, private cdr: ChangeDetectorRef) {}

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
    let list = this.items;
    if (this.filterCategory) list = list.filter(x => x.category === this.filterCategory);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x => [x.code, x.name, x.notes].some(v => v.toLowerCase().includes(t)));
    return list;
  }

  categoryCls(c: MovCategory): string { return this.categories.find(x => x.value === c)?.cls ?? ''; }
  categoryLabel(c: MovCategory): string { return this.categories.find(x => x.value === c)?.label ?? c; }
  directionCls(d: MovDirection): string { return this.directions.find(x => x.value === d)?.cls ?? ''; }
  directionLabel(d: MovDirection): string { return this.directions.find(x => x.value === d)?.label ?? d; }

  submit() {
    if (!this.form.code || !this.form.name) return;
    this.loading = true;
    const obs = this.editingId ? this.svc.update(this.editingId, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: MovementType) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, category: it.category, direction: it.direction, affectsStock: it.affectsStock, requiresLot: it.requiresLot, requiresReason: it.requiresReason, autoConsumed: it.autoConsumed, active: it.active, notes: it.notes };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este tipo de movimiento?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', category: 'CONSUMPTION', direction: 'OUT', affectsStock: true, requiresLot: false, requiresReason: false, autoConsumed: false, active: true, notes: '' };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
