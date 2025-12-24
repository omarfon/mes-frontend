import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Supplier {
  id: string;
  ruc: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-suppliers',
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
})
export class SuppliersComponent {
  form: Omit<Supplier, 'id'> = { ruc: '', name: '', contact: '', phone: '', email: '', active: true };
  items: Supplier[] = [
    { id: '1', ruc: '20123456789', name: 'Algodones del Perú SAC', contact: 'Carlos Ruiz', phone: '999888777', email: 'ventas@algodones.pe', active: true },
    { id: '2', ruc: '20456789012', name: 'Tintorería Andina', contact: 'Lucía Salas', phone: '988777666', email: 'contacto@andina.pe', active: true },
  ];

  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.ruc, x.name, x.contact, x.phone, x.email].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.ruc || !this.form.name) return;

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

  edit(it: Supplier) {
    this.editingId = it.id;
    this.form = { ruc: it.ruc, name: it.name, contact: it.contact, phone: it.phone, email: it.email, active: it.active };
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
    this.form = { ruc: '', name: '', contact: '', phone: '', email: '', active: true };
  }
}
