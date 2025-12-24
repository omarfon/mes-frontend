import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type LocationType = 'WAREHOUSE' | 'LINE' | 'STATION';

interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  parent?: string;   // ubicación padre opcional
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-locations',
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
})
export class LocationsComponent {
  form: Omit<Location, 'id'> = { code: '', name: '', type: 'WAREHOUSE', parent: '', active: true };
  items: Location[] = [
    { id: '1', code: 'ALM-01', name: 'Almacén Principal', type: 'WAREHOUSE', parent: '', active: true },
    { id: '2', code: 'LIN-01', name: 'Línea 1', type: 'LINE', parent: 'ALM-01', active: true },
  ];
  editingId: string | null = null;
  q = '';

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.type, x.parent || ''].some(v => v.toLowerCase().includes(t))
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

  edit(it: Location) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, type: it.type, parent: it.parent || '', active: it.active };
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
    this.form = { code: '', name: '', type: 'WAREHOUSE', parent: '', active: true };
  }
}
