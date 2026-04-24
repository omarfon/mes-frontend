import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorsService, Operator, OperatorRole, CreateOperatorDto } from './operators.service';

@Component({
  standalone: true,
  selector: 'app-operators',
  imports: [CommonModule, FormsModule],
  templateUrl: './operators.html',
})
export class OperatorsComponent implements OnInit {
  form: CreateOperatorDto = { code: '', fullName: '', role: 'OPERATOR', shiftCode: 'A', active: true };
  items: Operator[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  readonly roles: { value: OperatorRole; label: string }[] = [
    { value: 'OPERATOR', label: 'Operario' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'QUALITY', label: 'Calidad' },
  ];

  constructor(private svc: OperatorsService, private cdr: ChangeDetectorRef) {}

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
    return this.items.filter(x => [x.code, x.fullName, x.role, x.shiftCode].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.code || !this.form.fullName) return;
    this.loading = true;
    const obs = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Operator) {
    this.editingId = it.id;
    this.form = { code: it.code, fullName: it.fullName, role: it.role, shiftCode: it.shiftCode, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este operario?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', fullName: '', role: 'OPERATOR', shiftCode: 'A', active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un operario con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
