import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationsService, Location, LocationType, CreateLocationDto } from './locations.service';

@Component({
  standalone: true,
  selector: 'app-locations',
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
})
export class LocationsComponent implements OnInit {
  form: CreateLocationDto = { code: '', name: '', type: 'WAREHOUSE', parent: '', active: true };
  items: Location[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: LocationsService, private cdr: ChangeDetectorRef) {}

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
    return this.items.filter(x => [x.code, x.name, x.type, x.parent || ''].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.code || !this.form.name) return;
    this.loading = true;
    const obs = this.editingId ? this.svc.update(this.editingId, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Location) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, type: it.type as LocationType, parent: it.parent || '', active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta ubicación?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', type: 'WAREHOUSE', parent: '', active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un registro con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
