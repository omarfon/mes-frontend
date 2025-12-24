import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Shift {
  id: string;
  code: string;
  name: string;
  start: string; // HH:mm
  end: string;   // HH:mm
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-shifts',
  imports: [CommonModule, FormsModule],
  templateUrl: './schifts.html',
})
export class ShiftsComponent {
  form: Omit<Shift, 'id'> = { code: '', name: '', start: '07:00', end: '15:00', active: true };
  items: Shift[] = [
    { id: '1', code: 'A', name: 'Turno A', start: '07:00', end: '15:00', active: true },
    { id: '2', code: 'B', name: 'Turno B', start: '15:00', end: '23:00', active: true },
  ];

  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.name, x.start, x.end].some(v => v.toLowerCase().includes(t)));
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

  edit(it: Shift) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, start: it.start, end: it.end, active: it.active };
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
    this.form = { code: '', name: '', start: '07:00', end: '15:00', active: true };
  }
}
