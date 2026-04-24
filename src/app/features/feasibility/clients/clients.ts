import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-feasibility-clients',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
})
export class FeasibilityClientsComponent implements OnInit {
  items: any[] = [];
  loading = false;
  error: string | null = null;
  q = '';
  showForm = false;
  editingId: string | null = null;
  form = this.emptyForm();

  emptyForm() {
    return {
      code: '', name: '', contact: '', email: '', phone: '',
      address: '', city: '', country: '', taxId: '',
      sector: '', notes: '', active: true,
    };
  }

  get filtered() {
    const s = this.q.toLowerCase();
    return this.items.filter(i =>
      i.name?.toLowerCase().includes(s) ||
      i.code?.toLowerCase().includes(s) ||
      i.sector?.toLowerCase().includes(s)
    );
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    // TODO: conectar con servicio HTTP
    setTimeout(() => { this.loading = false; }, 300);
  }

  openNew() {
    this.form = this.emptyForm();
    this.editingId = null;
    this.showForm = true;
  }

  edit(item: any) {
    this.editingId = item.id;
    this.form = { ...item };
    this.showForm = true;
  }

  cancel() { this.showForm = false; this.editingId = null; this.error = null; }

  submit() {
    if (!this.form.code || !this.form.name) {
      this.error = 'Código y nombre son obligatorios.';
      return;
    }
    this.error = null;
    if (this.editingId) {
      const idx = this.items.findIndex(i => i.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.form, id: this.editingId };
    } else {
      this.items.push({ ...this.form, id: crypto.randomUUID() });
    }
    this.cancel();
  }

  remove(id: string) {
    this.items = this.items.filter(i => i.id !== id);
  }
}
