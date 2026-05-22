import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkCentersService, WorkCenter, WorkCenterType, CreateWorkCenterDto } from './work-centers.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-work-centers',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './work-centers.html',
})
export class WorkCentersComponent implements OnInit {
  form: CreateWorkCenterDto = {
    code: '', name: '', areaCode: '', type: 'LINE',
    capacityPcsPerHour: null, description: '', active: true,
  };

  items: WorkCenter[] = [];
  editingId: string | null = null;
  currentItem: WorkCenter | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  readonly wcTypes: { value: WorkCenterType; label: string }[] = [
    { value: 'LINE', label: 'Línea de producción' },
    { value: 'CELL', label: 'Celda de trabajo' },
    { value: 'WORK_CENTER', label: 'Centro de trabajo' },
  ];

  constructor(private svc: WorkCentersService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

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
    return this.items.filter(x =>
      [x.code, x.name, x.areaCode, x.type, x.description].some(v => v.toLowerCase().includes(t))
    );
  }

  typeLabel(type: WorkCenterType): string {
    return this.wcTypes.find(t => t.value === type)?.label ?? type;
  }

  typeBadge(type: WorkCenterType): string {
    const map: Record<string, string> = {
      LINE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      CELL: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      WORK_CENTER: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
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
      next: () => { this.toast.show(this.editingId ? 'Registro actualizado' : 'Registro creado'); this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); this.formPanelOpen = false; },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: WorkCenter) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code, name: it.name, areaCode: it.areaCode, type: it.type,
      capacityPcsPerHour: it.capacityPcsPerHour, description: it.description, active: it.active,
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: WorkCenter) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code, name: it.name, areaCode: it.areaCode, type: it.type,
      capacityPcsPerHour: it.capacityPcsPerHour, description: it.description, active: it.active,
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar centro de trabajo', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Centro de trabajo eliminado'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = false; }

  resetForm() {
    this.form = { code: '', name: '', areaCode: '', type: 'LINE', capacityPcsPerHour: null, description: '', active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Ya existe un registro con ese código.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}

