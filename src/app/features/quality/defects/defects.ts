import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityStoreService, Defect } from '../services/quality-store.service';

@Component({
  standalone: true,
  selector: 'app-defects',
  imports: [CommonModule, FormsModule],
  templateUrl: './defects.html',
})
export class DefectsComponent {
  q = '';
  editing: Defect | null = null;

  form: Partial<Defect> = {
    code: '',
    name: '',
    familyId: '',
    severityId: '',
    description: '',
    isActive: true,
  };

  constructor(public qs: QualityStoreService) {}

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.qs.defects.filter(d => {
      const fam = this.qs.familyName(d.familyId);
      const sev = this.qs.severityName(d.severityId);
      if (!t) return true;
      return [d.code, d.name, fam, sev, d.description ?? ''].join(' ').toLowerCase().includes(t);
    });
  }

  new() {
    this.editing = null;
    this.form = {
      code: '',
      name: '',
      familyId: this.qs.families[0]?.id ?? '',
      severityId: this.qs.severities[0]?.id ?? '',
      description: '',
      isActive: true,
    };
  }

  edit(d: Defect) {
    this.editing = d;
    this.form = { ...d };
  }

  save() {
    if (!this.form.code || !this.form.name || !this.form.familyId || !this.form.severityId) return;

    const payload: Defect = {
      id: this.editing?.id ?? this.qs.newId('def'),
      code: this.form.code!,
      name: this.form.name!,
      familyId: this.form.familyId!,
      severityId: this.form.severityId!,
      description: this.form.description ?? '',
      isActive: !!this.form.isActive,
    };

    if (!this.editing) this.qs.defects.unshift(payload);
    else {
      const idx = this.qs.defects.findIndex(x => x.id === this.editing!.id);
      if (idx >= 0) this.qs.defects[idx] = payload;
    }

    this.new();
  }

  famName(id: string) { return this.qs.familyName(id); }
  sevName(id: string) { return this.qs.severityName(id); }
}
