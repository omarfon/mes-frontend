import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type MachineStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

interface Machine {
  id: string;
  code: string;
  name: string;
  process: string;
  line: string;
  status: MachineStatus;
}

@Component({
  standalone: true,
  selector: 'app-machines',
  imports: [CommonModule, FormsModule],
  templateUrl: './machines.html',
})
export class MachinesComponent {
  form: Omit<Machine, 'id'> = {
    code: '',
    name: '',
    process: '',
    line: '',
    status: 'ACTIVE',
  };

  items: Machine[] = [
    { id: '1', code: 'MC-001', name: 'Hiladora 01', process: 'Hilado', line: 'Línea 1', status: 'ACTIVE' },
    { id: '2', code: 'MC-002', name: 'Carda 02', process: 'Cardado', line: 'Línea 2', status: 'MAINTENANCE' },
  ];

  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.process, x.line, x.status].some(v => v.toLowerCase().includes(t))
    );
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

  edit(item: Machine) {
    this.editingId = item.id;
    this.form = { code: item.code, name: item.name, process: item.process, line: item.line, status: item.status };
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
    this.form = { code: '', name: '', process: '', line: '', status: 'ACTIVE' };
  }
}
