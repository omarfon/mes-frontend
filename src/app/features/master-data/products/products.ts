import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ProductType = 'YARN' | 'FABRIC' | 'GARMENT';

interface Product {
  id: string;
  code: string;
  name: string;
  type: ProductType;
  uom: string;
  spec: string;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
})
export class ProductsComponent {
  form: Omit<Product, 'id'> = {
    code: '',
    name: '',
    type: 'YARN',
    uom: 'kg',
    spec: '',
    active: true,
  };

  items: Product[] = [
    { id: '1', code: 'PRD-HIL-20', name: 'Hilo 20/1', type: 'YARN', uom: 'kg', spec: 'Algodón peinado', active: true },
    { id: '2', code: 'PRD-TEL-180', name: 'Tela Jersey 180', type: 'FABRIC', uom: 'm', spec: '180 g/m²', active: true },
  ];

  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.name, x.type, x.uom, x.spec].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.code || !this.form.name) return;

    if (this.editingId) {
      const idx = this.items.findIndex(x => x.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...this.form };
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    this.items.unshift({ id, ...this.form });
    this.resetForm();
  }

  edit(it: Product) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, type: it.type, uom: it.uom, spec: it.spec, active: it.active };
  }

  remove(id: string) {
    this.items = this.items.filter(x => x.id !== id);
    if (this.editingId === id) this.cancelEdit();
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = { code: '', name: '', type: 'YARN', uom: 'kg', spec: '', active: true };
  }
}

