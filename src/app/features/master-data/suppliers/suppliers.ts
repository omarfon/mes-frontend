import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService, Supplier, CreateSupplierDto } from './suppliers.service';

@Component({
  standalone: true,
  selector: 'app-suppliers',
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
})
export class SuppliersComponent implements OnInit {
  form: CreateSupplierDto = { ruc: '', name: '', contact: '', phone: '', email: '', active: true };
  items: Supplier[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: SuppliersService, private cdr: ChangeDetectorRef) {}

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
    return this.items.filter(x => [x.ruc, x.name, x.contact, x.phone, x.email].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.ruc || !this.form.name) return;
    this.loading = true;
    const obs = this.editingId ? this.svc.update(this.editingId, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Supplier) {
    this.editingId = it.id;
    this.form = { ruc: it.ruc, name: it.name, contact: it.contact, phone: it.phone, email: it.email, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() { this.form = { ruc: '', name: '', contact: '', phone: '', email: '', active: true }; }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
