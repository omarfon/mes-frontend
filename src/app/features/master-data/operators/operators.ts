import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OperatorRole = 'OPERATOR' | 'SUPERVISOR' | 'QUALITY';

interface Operator {
  id: string;
  code: string;
  fullName: string;
  role: OperatorRole;
  shiftCode: string;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-operators',
  imports: [CommonModule, FormsModule],
  templateUrl: './operators.html',
})
export class OperatorsComponent {
  form: Omit<Operator, 'id'> = { code: '', fullName: '', role: 'OPERATOR', shiftCode: 'A', active: true };
  items: Operator[] = [
    { id: '1', code: 'OP-001', fullName: 'Juan Pérez', role: 'OPERATOR', shiftCode: 'A', active: true },
    { id: '2', code: 'QA-002', fullName: 'María Torres', role: 'QUALITY', shiftCode: 'B', active: true },
  ];

  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x => [x.code, x.fullName, x.role, x.shiftCode].some(v => v.toLowerCase().includes(t)));
  }

  submit() {
    if (!this.form.code || !this.form.fullName) return;

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

  edit(it: Operator) {
    this.editingId = it.id;
    this.form = { code: it.code, fullName: it.fullName, role: it.role, shiftCode: it.shiftCode, active: it.active };
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
    this.form = { code: '', fullName: '', role: 'OPERATOR', shiftCode: 'A', active: true };
  }
}
