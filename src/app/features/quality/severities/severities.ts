import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityStoreService, Severity, SeverityLevel } from '../services/quality-store.service';

@Component({
  standalone: true,
  selector: 'app-severities',
  imports: [CommonModule, FormsModule],
  templateUrl: './severities.html',
})
export class SeveritiesComponent {
  q = '';
  editing: Severity | null = null;

  form: Partial<Severity> = {
    code: '',
    name: '',
    level: 'LOW' as SeverityLevel,
    points: 1,
    isActive: true,
  };

  levels: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  constructor(public qs: QualityStoreService) {}

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.qs.severities.filter(s => {
      if (!t) return true;
      return [s.code, s.name, s.level, String(s.points)].join(' ').toLowerCase().includes(t);
    });
  }

  new() {
    this.editing = null;
    this.form = { code: '', name: '', level: 'LOW' as SeverityLevel, points: 1, isActive: true };
  }

  edit(s: Severity) {
    this.editing = s;
    this.form = { ...s };
  }

  save() {
    if (!this.form.code || !this.form.name || !this.form.level) return;

    const payload: Severity = {
      id: this.editing?.id ?? this.qs.newId('sev'),
      code: this.form.code!,
      name: this.form.name!,
      level: this.form.level,
      points: Number(this.form.points || 0),
      description: this.form.description,
      isActive: !!this.form.isActive,
      createdAt: this.editing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    if (!this.editing) this.qs.severities.unshift(payload);
    else {
      const idx = this.qs.severities.findIndex(x => x.id === this.editing!.id);
      if (idx >= 0) this.qs.severities[idx] = payload;
    }

    this.new();
  }
}
