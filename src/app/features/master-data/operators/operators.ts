import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorsService, Operator, OperatorRole, CreateOperatorDto } from './operators.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-operators',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './operators.html',
})
export class OperatorsComponent implements OnInit {
  form: CreateOperatorDto = { code: '', fullName: '', role: 'OPERATOR', shiftCode: 'A', active: true };
  items: Operator[] = [];
  editingId: string | null = null;
  currentItem: Operator | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  readonly roles: { value: OperatorRole; label: string }[] = [
    { value: 'OPERATOR', label: 'Operario' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'QUALITY', label: 'Calidad' },
  ];

  constructor(private svc: OperatorsService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

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

  openCreatePanel() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = true; }

  submit() {
    if (!this.form.code || !this.form.fullName) return;
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

  edit(it: Operator) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { code: it.code, fullName: it.fullName, role: it.role, shiftCode: it.shiftCode, active: it.active };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: Operator) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { code: it.code, fullName: it.fullName, role: it.role, shiftCode: it.shiftCode, active: it.active };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar operario', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Operario eliminado'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.viewOnly = false; this.resetForm(); this.formPanelOpen = false; }

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
