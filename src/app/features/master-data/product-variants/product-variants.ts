import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductVariantsService, ProductVariant, CreateProductVariantDto } from './product-variants.service';

@Component({
  standalone: true,
  selector: 'app-product-variants',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-variants.html',
})
export class ProductVariantsComponent implements OnInit {
  form: CreateProductVariantDto = {
    sku: '', productCode: '', color: '', size: '', presentation: '',
    barcode: '', netWeight: null, weightUnit: 'kg', active: true,
  };

  items: ProductVariant[] = [];
  editingId: string | null = null;
  filterProduct = '';
  q = '';
  loading = false;
  error: string | null = null;

  readonly weightUnits = ['kg', 'g', 'lb', 'oz', 'un', 'm', 'yd'];

  constructor(private svc: ProductVariantsService, private cdr: ChangeDetectorRef) {}

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

  submit() {
    if (!this.form.sku || !this.form.productCode) return;
    this.loading = true;
    const obs = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: ProductVariant) {
    this.editingId = it.id;
    this.form = {
      sku: it.sku, productCode: it.productCode, color: it.color, size: it.size,
      presentation: it.presentation, barcode: it.barcode, netWeight: it.netWeight,
      weightUnit: it.weightUnit, active: it.active,
    };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta variante?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

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

