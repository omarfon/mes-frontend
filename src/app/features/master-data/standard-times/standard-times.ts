import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StandardTimesService, StandardTime, CreateStandardTimeDto } from './standard-times.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-standard-times',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
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
  currentItem: StandardTime | null = null;
  formPanelOpen = false;
  viewOnly = false;
  filterOperation = '';
  filterProduct = '';
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: StandardTimesService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

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

  openCreatePanel() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = true; }

  submit() {
    if (!this.form.operationCode) return;
    this.loading = true;
    const payload = { ...this.form } as any;
    const username = this.authSvc.getCurrentUsername();
    if (!this.editingId) {
      payload.createdBy = username;
    } else {
      payload.updatedBy = username;
    }
    const obs = this.editingId
      ? this.svc.update(this.editingId, payload)
      : this.svc.create(payload);
    obs.subscribe({
      next: () => { this.toast.show(this.editingId ? 'Registro actualizado' : 'Registro creado'); this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); this.formPanelOpen = false; },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: StandardTime) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      operationCode: it.operationCode, operationName: it.operationName,
      productCode: it.productCode, workCenterCode: it.workCenterCode,
      setupMin: it.setupMin, cycleMin: it.cycleMin, timePerUnitMin: it.timePerUnitMin,
      batchSize: it.batchSize, efficiencyPct: it.efficiencyPct,
      validFrom: it.validFrom, active: it.active, notes: it.notes,
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: StandardTime) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      operationCode: it.operationCode, operationName: it.operationName,
      productCode: it.productCode, workCenterCode: it.workCenterCode,
      setupMin: it.setupMin, cycleMin: it.cycleMin, timePerUnitMin: it.timePerUnitMin,
      batchSize: it.batchSize, efficiencyPct: it.efficiencyPct,
      validFrom: it.validFrom, active: it.active, notes: it.notes,
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar tiempo estándar', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Tiempo estándar eliminado'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.viewOnly = false; this.resetForm(); this.formPanelOpen = false; }

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
