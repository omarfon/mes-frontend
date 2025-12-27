import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  QualityStoreService,
  Inspection,
  InspectionFinding,
  InspectionType,
} from '../services/quality-store.service';

@Component({
  standalone: true,
  selector: 'app-inspections',
  imports: [CommonModule, FormsModule],
  templateUrl: './inspections.html',
})
export class InspectionsComponent {
  q = '';
  editing: Inspection | null = null;

  form: Partial<Inspection> = {
    code: '',
    type: 'INCOMING',
    date: new Date().toISOString().slice(0, 10),
    lotCode: '',
    serial: '',
    orderCode: '',
    operation: '',
    machineCode: '',
    sampleSize: 30,
    findings: [],
    result: 'PASS',
    inspector: 'calidad',
    notes: '',
  };

  findingDefectId = '';
  findingQty = 1;
  findingNote = '';

  constructor(public qs: QualityStoreService) {
    this.findingDefectId = this.qs.defects[0]?.id ?? '';
  }

  get list() {
    const t = this.q.trim().toLowerCase();
    return this.qs.inspections.filter(i => {
      if (!t) return true;
      return [i.code, i.type, i.date, i.lotCode ?? '', i.serial ?? '', i.result, i.inspector].join(' ')
        .toLowerCase()
        .includes(t);
    });
  }

  new() {
    this.editing = null;
    this.form = {
      code: `INSP-${String(this.qs.inspections.length + 1).padStart(4, '0')}`,
      type: 'INCOMING',
      date: new Date().toISOString().slice(0, 10),
      sampleSize: 30,
      findings: [],
      result: 'PASS',
      inspector: 'calidad',
      notes: '',
    };
    this.findingDefectId = this.qs.defects[0]?.id ?? '';
    this.findingQty = 1;
    this.findingNote = '';
  }

  edit(i: Inspection) {
    this.editing = i;
    this.form = { ...i, findings: [...i.findings] };
  }

  addFinding() {
    if (!this.form.findings) this.form.findings = [];
    if (!this.findingDefectId || this.findingQty <= 0) return;

    (this.form.findings as InspectionFinding[]).push({
      defectId: this.findingDefectId,
      qty: Number(this.findingQty),
      note: this.findingNote?.trim() || '',
    });

    this.findingQty = 1;
    this.findingNote = '';
    this.recalc();
  }

  removeFinding(idx: number) {
    (this.form.findings as InspectionFinding[]).splice(idx, 1);
    this.recalc();
  }

  recalc() {
    const tmp: Inspection = {
      id: 'tmp',
      code: this.form.code ?? '',
      type: (this.form.type as InspectionType) ?? 'INCOMING',
      date: this.form.date ?? new Date().toISOString().slice(0, 10),
      sampleSize: Number(this.form.sampleSize || 0),
      findings: (this.form.findings as InspectionFinding[]) ?? [],
      result: 'PASS',
      inspector: this.form.inspector ?? 'calidad',
      notes: this.form.notes ?? '',
      lotCode: this.form.lotCode ?? '',
      serial: this.form.serial ?? '',
      orderCode: this.form.orderCode ?? '',
      operation: this.form.operation ?? '',
      machineCode: this.form.machineCode ?? '',
      shift: this.form.shift ?? '',
    };
    this.form.result = this.qs.computeInspectionResult(tmp);
  }

  score() {
    const tmp: Inspection = {
      id: 'tmp',
      code: this.form.code ?? '',
      type: (this.form.type as InspectionType) ?? 'INCOMING',
      date: this.form.date ?? new Date().toISOString().slice(0, 10),
      sampleSize: Number(this.form.sampleSize || 0),
      findings: (this.form.findings as InspectionFinding[]) ?? [],
      result: 'PASS',
      inspector: this.form.inspector ?? 'calidad',
      notes: this.form.notes ?? '',
      lotCode: this.form.lotCode ?? '',
      serial: this.form.serial ?? '',
      orderCode: this.form.orderCode ?? '',
      operation: this.form.operation ?? '',
      machineCode: this.form.machineCode ?? '',
      shift: this.form.shift ?? '',
    };
    return this.qs.computeInspectionScore(tmp);
  }

  save() {
    if (!this.form.code || !this.form.type || !this.form.date) return;

    const payload: Inspection = {
      id: this.editing?.id ?? this.qs.newId('insp'),
      code: this.form.code!,
      type: this.form.type as InspectionType,
      date: this.form.date!,
      shift: this.form.shift ?? '',
      lotCode: this.form.lotCode ?? '',
      serial: this.form.serial ?? '',
      orderCode: this.form.orderCode ?? '',
      operation: this.form.operation ?? '',
      machineCode: this.form.machineCode ?? '',
      sampleSize: Number(this.form.sampleSize || 0),
      findings: (this.form.findings as InspectionFinding[]) ?? [],
      result: (this.form.result as any) ?? 'PASS',
      inspector: this.form.inspector ?? 'calidad',
      notes: this.form.notes ?? '',
    };

    if (!this.editing) this.qs.inspections.unshift(payload);
    else {
      const idx = this.qs.inspections.findIndex(x => x.id === this.editing!.id);
      if (idx >= 0) this.qs.inspections[idx] = payload;
    }

    this.new();
  }

  defectLabel(defectId: string) {
    const d = this.qs.defects.find(x => x.id === defectId);
    if (!d) return '-';
    return `${d.code} · ${d.name}`;
  }

  severityLabel(defectId: string) {
    const d = this.qs.defects.find(x => x.id === defectId);
    if (!d) return '-';
    const s = this.qs.severities.find(x => x.id === d.severityId);
    return s ? `${s.level} (${s.points} pts)` : '-';
  }
}
