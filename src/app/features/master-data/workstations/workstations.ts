import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkstationsService, Workstation, WorkstationType, CreateWorkstationDto } from './workstations.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-workstations',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './workstations.html',
})
export class WorkstationsComponent implements OnInit {
  form: CreateWorkstationDto = {
    code: '', name: '', workCenterCode: '', type: 'MANUAL',
    asset: '', operatorSlots: 1, active: true,
  };

  items: Workstation[] = [];
  editingId: string | null = null;
  currentItem: Workstation | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: WorkstationsService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  readonly wsTypes: { value: WorkstationType; label: string }[] = [
    { value: 'MANUAL', label: 'Manual' },
    { value: 'SEMI_AUTO', label: 'Semi-automático' },
    { value: 'AUTOMATED', label: 'Automatizado' },
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.workCenterCode, x.asset].some(v => v.toLowerCase().includes(t))
    );
  }

  typeLabel(type: WorkstationType): string {
    return this.wsTypes.find(t => t.value === type)?.label ?? type;
  }

  typeBadge(type: WorkstationType): string {
    const map: Record<string, string> = {
      MANUAL: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      SEMI_AUTO: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      AUTOMATED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    };
    return 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ' + (map[type] ?? '');
  }

  openCreatePanel() {
    this.editingId = null;
    this.currentItem = null;
    this.resetForm();
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  submit() {
    if (!this.form.code || !this.form.name) return;
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
      next: () => { this.toast.show(this.editingId ? 'Estación actualizada' : 'Estación creada'); this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); this.formPanelOpen = false; },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Workstation) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code, name: it.name, workCenterCode: it.workCenterCode,
      type: it.type, asset: it.asset, operatorSlots: it.operatorSlots, active: it.active,
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: Workstation) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code, name: it.name, workCenterCode: it.workCenterCode,
      type: it.type, asset: it.asset, operatorSlots: it.operatorSlots, active: it.active,
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar estación', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Estación eliminada'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.viewOnly = false; this.resetForm(); this.formPanelOpen = false; }

  resetForm() {
    this.form = { code: '', name: '', workCenterCode: '', type: 'MANUAL', asset: '', operatorSlots: 1, active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un registro con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
