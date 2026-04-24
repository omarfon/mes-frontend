import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService, Material, MaterialType, CreateMaterialDto } from './materials.service';

@Component({
  standalone: true,
  selector: 'app-materials',
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.html',
})
export class MaterialsComponent implements OnInit {
  form: CreateMaterialDto = { code: '', name: '', type: 'RAW', uom: 'kg', active: true };
  items: Material[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: MaterialsService, private cdr: ChangeDetectorRef) {}

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
    return this.items.filter(x => [x.code, x.name, x.type, x.uom].some(v => v.toLowerCase().includes(t)));
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

  edit(it: Material) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, type: it.type as MaterialType, uom: it.uom, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este material?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() { this.form = { code: '', name: '', type: 'RAW', uom: 'kg', active: true }; }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
