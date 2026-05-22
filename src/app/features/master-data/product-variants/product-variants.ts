import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductVariantsService, ProductVariant, CreateProductVariantDto } from './product-variants.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-product-variants',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './product-variants.html',
})
export class ProductVariantsComponent implements OnInit {
  form: CreateProductVariantDto = {
    sku: '', productCode: '', color: '', size: '', presentation: '',
    barcode: '', netWeight: null, weightUnit: 'kg', active: true,
  };

  items: ProductVariant[] = [];
  editingId: string | null = null;
  currentItem: ProductVariant | null = null;
  formPanelOpen = false;
  viewOnly = false;
  filterProduct = '';
  q = '';
  loading = false;
  error: string | null = null;

  readonly weightUnits = ['kg', 'g', 'lb', 'oz', 'un', 'm', 'yd'];

  constructor(private svc: ProductVariantsService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

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
      [x.sku, x.productCode, x.color, x.size, x.presentation, x.barcode].some(v => v.toLowerCase().includes(t))
    );
    return list;
  }

  openCreatePanel() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = true; }

  submit() {
    if (!this.form.sku || !this.form.productCode) return;
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

  edit(it: ProductVariant) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      sku: it.sku, productCode: it.productCode, color: it.color, size: it.size,
      presentation: it.presentation, barcode: it.barcode, netWeight: it.netWeight,
      weightUnit: it.weightUnit, active: it.active,
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: ProductVariant) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      sku: it.sku, productCode: it.productCode, color: it.color, size: it.size,
      presentation: it.presentation, barcode: it.barcode, netWeight: it.netWeight,
      weightUnit: it.weightUnit, active: it.active,
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar variante', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Variante eliminada'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.viewOnly = false; this.resetForm(); this.formPanelOpen = false; }

  resetForm() {
    this.form = { sku: '', productCode: '', color: '', size: '', presentation: '', barcode: '', netWeight: null, weightUnit: 'kg', active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'SKU ya existe.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}

