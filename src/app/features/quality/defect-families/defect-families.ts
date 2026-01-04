import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityStoreService } from '../services/quality-store.service';
import { DefectFamily } from '../../../shared/models/quality.model';

@Component({
  standalone: true,
  selector: 'app-defect-families',
  imports: [CommonModule, FormsModule],
  templateUrl: './defect-families.html',
})
export class DefectFamiliesComponent {
  q = '';
  editing: DefectFamily | null = null;

  form: Partial<DefectFamily> = {
    code: '',
    name: '',
    description: '',
    isActive: true,
  };

  constructor(public qs: QualityStoreService) {}

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.qs.families.filter(f => {
      if (!t) return true;
      return [f.code, f.name, f.description ?? ''].join(' ').toLowerCase().includes(t);
    });
  }

  new() {
    this.editing = null;
    this.form = { code: '', name: '', description: '', isActive: true };
  }

  edit(f: DefectFamily) {
    this.editing = f;
    this.form = { ...f };
  }

  save() {
    if (!this.form.code || !this.form.name) return;

    if (!this.editing) {
      this.qs.families.unshift({
        id: this.qs.newId('fam'),
        code: this.form.code!,
        name: this.form.name!,
        description: this.form.description ?? '',
        isActive: !!this.form.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      const idx = this.qs.families.findIndex(x => x.id === this.editing!.id);
      if (idx >= 0) {
        this.qs.families[idx] = {
          ...this.qs.families[idx],
          code: this.form.code!,
          name: this.form.name!,
          description: this.form.description ?? '',
          isActive: !!this.form.isActive,
        };
      }
    }
    this.new();
  }
}

// En quality-store.service.ts, después de las importaciones existentes (alrededor de la línea 11)
// Re-exportar los tipos para que estén disponibles para otros módulos
export type { DefectFamily, Defect, Severity } from '../../../shared/models/quality.model';
