import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ReasonCategory = 'MAINTENANCE' | 'MATERIAL' | 'SETUP' | 'QUALITY' | 'OTHER';

interface DowntimeReason {
  id: string;
  code: string;
  name: string;
  category: ReasonCategory;
  planned: boolean;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-downtime-reasons',
  imports: [CommonModule, FormsModule],
  templateUrl: './downtimes-reasons.html',
})
export class DowntimeReasonsComponent {
  form: Omit<DowntimeReason, 'id'> = {
    code: '',
    name: '',
    category: 'MAINTENANCE',
    planned: false,
    active: true,
  };

  items: DowntimeReason[] = [
    { id: '1', code: 'DT-MNT', name: 'Mantenimiento preventivo', category: 'MAINTENANCE', planned: true, active: true },
    { id: '2', code: 'DT-MAT', name: 'Falta de material', category: 'MATERIAL', planned: false, active: true },
  ];

  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.name, x.category].some(v => v.toLowerCase().includes(t)));
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

  edit(it: DowntimeReason) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, category: it.category, planned: it.planned, active: it.active };
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
    this.form = { code: '', name: '', category: 'MAINTENANCE', planned: false, active: true };
  }
}
