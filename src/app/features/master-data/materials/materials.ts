import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type MaterialType = 'RAW' | 'WIP' | 'FINISHED';

interface Material {
  id: string;
  code: string;
  name: string;
  type: MaterialType;
  uom: string;     // unidad
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-materials',
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.html',
})
export class MaterialsComponent {
  form: Omit<Material, 'id'> = { code: '', name: '', type: 'RAW', uom: 'kg', active: true };
  items: Material[] = [
    { id: '1', code: 'MAT-ALG', name: 'Algodón', type: 'RAW', uom: 'kg', active: true },
    { id: '2', code: 'MAT-HIL', name: 'Hilo 20/1', type: 'WIP', uom: 'kg', active: true },
  ];
  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.name, x.type, x.uom].some(v => v.toLowerCase().includes(t)));
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

  edit(it: Material) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, type: it.type, uom: it.uom, active: it.active };
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
    this.form = { code: '', name: '', type: 'RAW', uom: 'kg', active: true };
  }
}
