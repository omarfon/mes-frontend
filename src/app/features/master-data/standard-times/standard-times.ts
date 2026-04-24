import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StandardTimesService, StandardTime, CreateStandardTimeDto } from './standard-times.service';

@Component({
  standalone: true,
  selector: 'app-standard-times',
  imports: [CommonModule, FormsModule],
  templateUrl: './standard-times.html',
})
export class StandardTimesComponent implements OnInit {
  form: CreateStandardTimeDto = {
    operationCode: '', operationName: '', productCode: '', workCenterCode: '',
    setupMin: 0, cycleMin: 1, timePerUnitMin: 0, batchSize: 1,
    efficiencyPct: 85, validFrom: '', active: true, notes: '',
  };

  items: StandardTime[] = [];
  editingId: string | null = null;
  filterOperation = '';
  filterProduct = '';
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: StandardTimesService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get uniqueOperations(): string[] {
    return [...new Set(this.items.map(i => i.operationCode))].sort();
  }

  get uniqueProducts(): string[] {
    return [...new Set(this.items.map(i => i.productCode))].sort();
  }

  get filtered() {
    let list = this.items;
    if (this.filterOperation) list = list.filter(x => x.operationCode === this.filterOperation);
    if (this.filterProduct) list = list.filter(x => x.productCode === this.filterProduct);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x =>
      [x.operationCode, x.operationName, x.productCode, x.workCenterCode, x.notes]
        .some(v => v.toLowerCase().includes(t))
    );
    return list;
  }

  computeTimePerUnit() {
    const batchSize = this.form.batchSize ?? 0;
    const cycleMin = this.form.cycleMin ?? 0;

    if (batchSize > 0 && cycleMin > 0) {
      this.form.timePerUnitMin = +(cycleMin / batchSize).toFixed(4);
    }
  }

  submit() {
    if (!this.form.operationCode) return;
    this.loading = true;
    const obs = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: StandardTime) {
    this.editingId = it.id;
    this.form = {
      operationCode: it.operationCode, operationName: it.operationName,
      productCode: it.productCode, workCenterCode: it.workCenterCode,
      setupMin: it.setupMin, cycleMin: it.cycleMin, timePerUnitMin: it.timePerUnitMin,
      batchSize: it.batchSize, efficiencyPct: it.efficiencyPct,
      validFrom: it.validFrom, active: it.active, notes: it.notes,
    };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este tiempo estándar?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = {
      operationCode: '', operationName: '', productCode: '', workCenterCode: '',
      setupMin: 0, cycleMin: 1, timePerUnitMin: 0, batchSize: 1,
      efficiencyPct: 85, validFrom: '', active: true, notes: '',
    };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Conflicto de datos.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
