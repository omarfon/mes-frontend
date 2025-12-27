import { Injectable } from '@angular/core';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DefectFamily {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Severity {
  id: string;
  code: string;
  name: string;
  level: SeverityLevel;
  points: number;       // ponderación
  colorTag?: string;    // opcional UI
  isActive: boolean;
}

export interface Defect {
  id: string;
  code: string;
  name: string;
  familyId: string;
  severityId: string;
  description?: string;
  isActive: boolean;
}

export type InspectionType = 'INCOMING' | 'IN_PROCESS' | 'FINAL';
export type InspectionResult = 'PASS' | 'FAIL' | 'HOLD';

export interface InspectionFinding {
  defectId: string;
  qty: number;
  note?: string;
}

export interface Inspection {
  id: string;
  code: string;               // INSP-...
  type: InspectionType;
  date: string;               // YYYY-MM-DD
  shift?: string;

  // Referencias MES (lo conectamos luego)
  lotCode?: string;
  serial?: string;
  orderCode?: string;
  operation?: string;
  machineCode?: string;

  sampleSize: number;
  findings: InspectionFinding[];
  result: InspectionResult;
  inspector: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class QualityStoreService {
  families: DefectFamily[] = [
    { id: 'f1', code: 'FAM-VIS', name: 'Visual', description: 'Defectos visuales/estéticos', isActive: true },
    { id: 'f2', code: 'FAM-DIM', name: 'Dimensional', description: 'Medidas/tolerancias', isActive: true },
    { id: 'f3', code: 'FAM-COL', name: 'Color', description: 'Variación/tono', isActive: true },
  ];

  severities: Severity[] = [
    { id: 's1', code: 'SEV-L', name: 'Leve', level: 'LOW', points: 1, isActive: true },
    { id: 's2', code: 'SEV-M', name: 'Media', level: 'MEDIUM', points: 3, isActive: true },
    { id: 's3', code: 'SEV-H', name: 'Alta', level: 'HIGH', points: 7, isActive: true },
    { id: 's4', code: 'SEV-C', name: 'Crítica', level: 'CRITICAL', points: 15, isActive: true },
  ];

  defects: Defect[] = [
    { id: 'd1', code: 'DEF-MAN', name: 'Mancha', familyId: 'f1', severityId: 's2', isActive: true },
    { id: 'd2', code: 'DEF-ROT', name: 'Rotura', familyId: 'f1', severityId: 's3', isActive: true },
    { id: 'd3', code: 'DEF-TON', name: 'Tono fuera de estándar', familyId: 'f3', severityId: 's3', isActive: true },
    { id: 'd4', code: 'DEF-MED', name: 'Medida fuera de tolerancia', familyId: 'f2', severityId: 's4', isActive: true },
  ];

  inspections: Inspection[] = [
    {
      id: 'i1',
      code: 'INSP-0001',
      type: 'INCOMING',
      date: '2025-12-23',
      lotCode: 'LOT-MP-0001',
      sampleSize: 30,
      findings: [{ defectId: 'd1', qty: 2 }],
      result: 'PASS',
      inspector: 'calidad',
      notes: 'Recepción OK',
    },
  ];

  // helpers
  familyName(id: string) { return this.families.find(f => f.id === id)?.name ?? '-'; }
  severityName(id: string) { return this.severities.find(s => s.id === id)?.name ?? '-'; }
  defectById(id: string) { return this.defects.find(d => d.id === id) ?? null; }
  severityById(id: string) { return this.severities.find(s => s.id === id) ?? null; }

  newId(prefix: string) { return `${prefix}-${crypto.randomUUID?.() ?? String(Date.now())}`; }

  computeInspectionScore(ins: Inspection) {
    // score = sum(qty * points)
    return ins.findings.reduce((acc, f) => {
      const def = this.defectById(f.defectId);
      const sev = def ? this.severityById(def.severityId) : null;
      return acc + (f.qty * (sev?.points ?? 0));
    }, 0);
  }

  computeInspectionResult(ins: Inspection): InspectionResult {
    // regla simple pro: si hay crítica => HOLD, si score > X => FAIL
    const hasCritical = ins.findings.some(f => {
      const def = this.defectById(f.defectId);
      const sev = def ? this.severityById(def.severityId) : null;
      return sev?.level === 'CRITICAL' && f.qty > 0;
    });
    if (hasCritical) return 'HOLD';

    const score = this.computeInspectionScore(ins);
    if (score >= 20) return 'FAIL';
    if (score > 0) return 'PASS';
    return 'PASS';
  }
}
