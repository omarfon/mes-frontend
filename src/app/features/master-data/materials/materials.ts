import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService, Material, MaterialType, CreateMaterialDto } from './materials.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-materials',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './materials.html',
})
export class MaterialsComponent implements OnInit {
  form: CreateMaterialDto = { code: '', name: '', type: 'RAW', uom: 'kg', active: true };
  items: Material[] = [];
  editingId: string | null = null;
  currentItem: Material | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: MaterialsService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

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

  openCreatePanel() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = true; }

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
    const obs = this.editingId ? this.svc.update(this.editingId, payload) : this.svc.create(payload);
    obs.subscribe({
      next: () => { this.toast.show(this.editingId ? 'Registro actualizado' : 'Registro creado'); this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); this.formPanelOpen = false; },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Material) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { code: it.code, name: it.name, type: it.type as MaterialType, uom: it.uom, active: it.active };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: Material) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { code: it.code, name: it.name, type: it.type as MaterialType, uom: it.uom, active: it.active };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar material', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Material eliminado'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.viewOnly = false; this.resetForm(); this.formPanelOpen = false; }

  resetForm() { this.form = { code: '', name: '', type: 'RAW', uom: 'kg', active: true }; }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
