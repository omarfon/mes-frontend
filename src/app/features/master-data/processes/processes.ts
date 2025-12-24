import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Process {
  id: string;
  code: string;
  name: string;
  order: number;   // secuencia
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-processes',
  imports: [CommonModule, FormsModule],
  templateUrl: './processes.html',
})
export class ProcessesComponent {
  form: Omit<Process, 'id'> = { code: '', name: '', order: 1, active: true };
  items: Process[] = [
    { id: '1', code: 'PR-CAR', name: 'Cardado', order: 1, active: true },
    { id: '2', code: 'PR-HIL', name: 'Hilado', order: 2, active: true },
  ];
  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.name, String(x.order)].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.code || !this.form.name) return;

    if (this.editingId) {
      const idx = this.items.findIndex(x => x.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...this.form, order: Number(this.form.order) };
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    this.items.unshift({ id, ...this.form, order: Number(this.form.order) });
    this.resetForm();
  }

  edit(it: Process) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, order: it.order, active: it.active };
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
    this.form = { code: '', name: '', order: 1, active: true };
  }
}
