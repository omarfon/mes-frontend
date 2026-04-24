import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderTypesService, OrderType, OrderPriority, CreateOrderTypeDto } from './order-types.service';

@Component({
  standalone: true,
  selector: 'app-order-types',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-types.html',
})
export class OrderTypesComponent implements OnInit {
  form: CreateOrderTypeDto = {
    code: '', name: '', description: '', priority: 'NORMAL',
    color: '#10b981', allowsRework: false, requiresQA: false, requiresRelease: false, active: true,
  };

  items: OrderType[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  readonly priorities: { value: OrderPriority; label: string; cls: string }[] = [
    { value: 'LOW', label: 'Baja', cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30' },
    { value: 'NORMAL', label: 'Normal', cls: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' },
    { value: 'HIGH', label: 'Alta', cls: 'bg-amber-500/10 text-amber-300 border border-amber-500/30' },
    { value: 'URGENT', label: 'Urgente', cls: 'bg-red-500/10 text-red-400 border border-red-500/30' },
  ];

  constructor(private svc: OrderTypesService, private cdr: ChangeDetectorRef) {}

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
    return this.items.filter(x => [x.code, x.name, x.description].some(v => v.toLowerCase().includes(t)));
  }

  priorityCls(priority: OrderPriority): string {
    return this.priorities.find(p => p.value === priority)?.cls ?? '';
  }

  priorityLabel(priority: OrderPriority): string {
    return this.priorities.find(p => p.value === priority)?.label ?? priority;
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

  edit(it: OrderType) {
    this.editingId = it.id;
    this.form = {
      code: it.code,
      name: it.name,
      description: it.description,
      priority: it.priority,
      color: it.color,
      allowsRework: it.allowsRework,
      requiresQA: it.requiresQA,
      requiresRelease: it.requiresRelease,
      active: it.active,
    };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este tipo de orden?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', description: '', priority: 'NORMAL', color: '#10b981', allowsRework: false, requiresQA: false, requiresRelease: false, active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un tipo con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
