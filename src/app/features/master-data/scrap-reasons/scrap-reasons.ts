import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrapReasonsService, ScrapReason, ScrapClass, CreateScrapReasonDto } from './scrap-reasons.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-scrap-reasons',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './scrap-reasons.html',
})
export class ScrapReasonsComponent implements OnInit {
  form: CreateScrapReasonDto = {
    code: '', name: '', classification: 'PROCESS',
    description: '', affectsEfficiency: true, reportable: true, active: true,
  };

  items: ScrapReason[] = [];
  editingId: string | null = null;
  currentItem: ScrapReason | null = null;
  formPanelOpen = false;
  viewOnly = false;
  filterClass: ScrapClass | '' = '';
  q = '';
  loading = false;
  error: string | null = null;

  readonly classes: { value: ScrapClass; label: string; cls: string; icon: string }[] = [
    { value: 'PROCESS', label: 'Proceso', cls: 'bg-blue-500/10 text-blue-300 border border-blue-500/30', icon: 'pi-cog' },
    { value: 'MACHINE', label: 'Máquina', cls: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30', icon: 'pi-server' },
    { value: 'MATERIAL', label: 'Material', cls: 'bg-amber-500/10 text-amber-300 border border-amber-500/30', icon: 'pi-box' },
    { value: 'OPERATOR', label: 'Operario', cls: 'bg-purple-500/10 text-purple-300 border border-purple-500/30', icon: 'pi-user' },
    { value: 'DESIGN', label: 'Diseño', cls: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30', icon: 'pi-pencil' },
    { value: 'OTHER', label: 'Otro', cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30', icon: 'pi-question-circle' },
  ];

  constructor(private svc: ScrapReasonsService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

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
    let list = this.items;
    if (this.filterClass) list = list.filter(x => x.classification === this.filterClass);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x => [x.code, x.name, x.description].some(v => v.toLowerCase().includes(t)));
    return list;
  }

  classCls(c: ScrapClass): string { return this.classes.find(x => x.value === c)?.cls ?? ''; }
  classLabel(c: ScrapClass): string { return this.classes.find(x => x.value === c)?.label ?? c; }
  countByClass(c: ScrapClass): number { return this.items.filter(x => x.classification === c).length; }

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

  edit(it: ScrapReason) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { code: it.code, name: it.name, classification: it.classification, description: it.description, affectsEfficiency: it.affectsEfficiency, reportable: it.reportable, active: it.active };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: ScrapReason) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { code: it.code, name: it.name, classification: it.classification, description: it.description, affectsEfficiency: it.affectsEfficiency, reportable: it.reportable, active: it.active };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar motivo de merma', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Motivo de merma eliminado'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.viewOnly = false; this.resetForm(); this.formPanelOpen = false; }

  resetForm() {
    this.form = { code: '', name: '', classification: 'PROCESS', description: '', affectsEfficiency: true, reportable: true, active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
