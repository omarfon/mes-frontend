import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Uom {
  id: string;
  code: string;   // kg, m, rollo, cono
  name: string;   // Kilogramo, Metro...
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-uoms',
  imports: [CommonModule, FormsModule],
  templateUrl: './uoms.html',
})
export class UomsComponent {
  form: Omit<Uom, 'id'> = { code: '', name: '', active: true };
  items: Uom[] = [
    { id: '1', code: 'kg', name: 'Kilogramo', active: true },
    { id: '2', code: 'm', name: 'Metro', active: true },
  ];
  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.name].some(v => v.toLowerCase().includes(t)));
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

  edit(it: Uom) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, active: it.active };
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
    this.form = { code: '', name: '', active: true };
  }
}
