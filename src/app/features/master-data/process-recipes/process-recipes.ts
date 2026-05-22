import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessRecipesService, ProcessRecipe, RecipeParam, CreateProcessRecipeDto, CreateRecipeParamDto } from './process-recipes.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-process-recipes',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './process-recipes.html',
})
export class ProcessRecipesComponent implements OnInit {
  form: CreateProcessRecipeDto = {
    code: '', name: '', productCode: '', operationCode: '',
    version: '1.0', approvedBy: '', approvedAt: '', active: true,
  };

  paramForm: CreateRecipeParamDto = {
    paramName: '', setpoint: '', minValue: '', maxValue: '', unit: '', critical: false, notes: '',
  };

  items: ProcessRecipe[] = [];
  selectedParams: RecipeParam[] = [];
  editingId: string | null = null;
  currentItem: ProcessRecipe | null = null;
  editingParamId: string | null = null;
  selectedId: string | null = null;
  q = '';
  filterProduct = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: ProcessRecipesService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get uniqueProducts(): string[] {
    return [...new Set(this.items.map(i => i.productCode))].sort();
  }

  get filtered() {
    let list = this.items;
    if (this.filterProduct) list = list.filter(x => x.productCode === this.filterProduct);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x =>
      [x.code, x.name, x.productCode, x.operationCode].some(v => v.toLowerCase().includes(t))
    );
    return list;
  }

  get selectedRecipe(): ProcessRecipe | null {
    return this.items.find(r => r.id === this.selectedId) ?? null;
  }

  selectRecipe(id: string) {
    if (this.selectedId === id) {
      this.selectedId = null;
      this.selectedParams = [];
      this.cancelParamEdit();
      return;
    }
    this.selectedId = id;
    this.cancelParamEdit();
    this.svc.getParams(id).subscribe({
      next: params => { this.selectedParams = params; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  submit() {
    if (!this.form.code || !this.form.productCode) return;
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
      next: () => {
        this.toast.show(this.editingId ? 'Receta actualizada' : 'Receta creada');
        this.load();
        this.editingId ? this.cancelEdit() : this.resetForm();
      },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: ProcessRecipe) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code,
      name: it.name,
      productCode: it.productCode,
      operationCode: it.operationCode,
      version: it.version,
      approvedBy: it.approvedBy,
      approvedAt: it.approvedAt,
      active: it.active,
    };
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar receta', message: '¿Estás seguro? Se eliminarán todos sus parámetros.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => {
            this.toast.show('Receta eliminada');
            if (this.selectedId === id) {
              this.selectedId = null;
              this.selectedParams = [];
            }
            if (this.editingId === id) this.cancelEdit();
            this.load();
          },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', productCode: '', operationCode: '', version: '1.0', approvedBy: '', approvedAt: '', active: true };
  }

  addParam() {
    if (!this.selectedId || !this.paramForm.paramName) return;
    const obs = this.editingParamId
      ? this.svc.updateParam(this.selectedId, this.editingParamId, this.paramForm)
      : this.svc.addParam(this.selectedId, this.paramForm);

    obs.subscribe({
      next: () => {
        this.cancelParamEdit();
        this.svc.getParams(this.selectedId!).subscribe(params => {
          this.selectedParams = params;
          this.cdr.detectChanges();
        });
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  editParam(p: RecipeParam) {
    this.editingParamId = p.id ?? null;
    this.paramForm = {
      paramName: p.paramName,
      setpoint: p.setpoint,
      minValue: p.minValue,
      maxValue: p.maxValue,
      unit: p.unit,
      critical: p.critical,
      notes: p.notes,
    };
  }

  removeParam(id?: string) {
    if (!id || !this.selectedId) return;
    this.confirmSvc.open({ title: 'Eliminar parámetro', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.deleteParam(this.selectedId!, id).subscribe({
          next: () => {
            this.toast.show('Parámetro eliminado');
            this.selectedParams = this.selectedParams.filter(p => p.id !== id);
            if (this.editingParamId === id) this.cancelParamEdit();
            this.cdr.detectChanges();
          },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelParamEdit() {
    this.editingParamId = null;
    this.resetParamForm();
  }

  resetParamForm() {
    this.paramForm = { paramName: '', setpoint: '', minValue: '', maxValue: '', unit: '', critical: false, notes: '' };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Código ya existe.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}
