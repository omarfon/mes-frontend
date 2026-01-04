import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityStoreService } from '../services/quality-store.service';

interface DailyStats {
  totalInspections: number;
  passed: number;
  failed: number;
  hold: number;
  passRate: number;
  totalDefects: number;
  criticalDefects: number;
}

interface DefectByFamily {
  family: string;
  count: number;
  percentage: number;
}

interface InspectionByType {
  type: string;
  count: number;
  passed: number;
  failed: number;
}

interface Inspection {
  id: string;
  code: string;
  type: string;
  date: string;
  shift: string;
  lotCode: string;
  serial?: string;
  orderCode?: string;
  operation?: string;
  machineCode?: string;
  sampleSize: number;
  findings?: Array<{ defectId: string; qty: number; note?: string }>;
  result: string;
  inspector: string;
  notes?: string;
}

const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'i1',
    code: 'INSP-0001',
    type: 'INCOMING',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-MP-0001',
    serial: 'SN-001',
    orderCode: 'OP-1234',
    operation: 'Recepción MP',
    machineCode: 'REC-01',
    sampleSize: 50,
    findings: [
      { defectId: 'd1', qty: 2, note: 'Manchas menores' },
      { defectId: 'd3', qty: 1 }
    ],
    result: 'PASS',
    inspector: 'Juan Pérez',
    notes: 'Materia prima aceptable',
  },
  {
    id: 'i2',
    code: 'INSP-0002',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-WIP-0045',
    orderCode: 'OP-1235',
    operation: 'Proceso A',
    machineCode: 'MACH-05',
    sampleSize: 100,
    findings: [
      { defectId: 'd2', qty: 5, note: 'Roturas en bordes' },
      { defectId: 'd1', qty: 3 }
    ],
    result: 'FAIL',
    inspector: 'María García',
    notes: 'Lote rechazado - múltiples defectos',
  },
  {
    id: 'i3',
    code: 'INSP-0003',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-FG-0120',
    serial: 'SN-120',
    orderCode: 'OP-1236',
    operation: 'Inspección Final',
    sampleSize: 200,
    findings: [
      { defectId: 'd4', qty: 1, note: 'Medida crítica fuera de tolerancia' }
    ],
    result: 'HOLD',
    inspector: 'Carlos Ruiz',
    notes: 'En espera de revisión por medida crítica',
  },
  {
    id: 'i4',
    code: 'INSP-0004',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-WIP-0046',
    orderCode: 'OP-1237',
    operation: 'Proceso B',
    machineCode: 'MACH-12',
    sampleSize: 80,
    findings: [],
    result: 'PASS',
    inspector: 'Ana López',
    notes: 'Sin defectos encontrados',
  },
  {
    id: 'i5',
    code: 'INSP-0005',
    type: 'INCOMING',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-MP-0002',
    sampleSize: 60,
    findings: [
      { defectId: 'd3', qty: 8, note: 'Variación de color significativa' }
    ],
    result: 'FAIL',
    inspector: 'Juan Pérez',
    notes: 'Lote rechazado por color',
  },
  {
    id: 'i6',
    code: 'INSP-0006',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-FG-0121',
    serial: 'SN-121',
    orderCode: 'OP-1238',
    sampleSize: 150,
    findings: [
      { defectId: 'd1', qty: 1 }
    ],
    result: 'PASS',
    inspector: 'María García',
  },
  {
    id: 'i7',
    code: 'INSP-0007',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Noche',
    lotCode: 'LOT-WIP-0047',
    orderCode: 'OP-1239',
    operation: 'Proceso C',
    machineCode: 'MACH-08',
    sampleSize: 120,
    findings: [
      { defectId: 'd1', qty: 4 },
      { defectId: 'd2', qty: 2 }
    ],
    result: 'PASS',
    inspector: 'Carlos Ruiz',
  },
  {
    id: 'i8',
    code: 'INSP-0008',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Noche',
    lotCode: 'LOT-FG-0122',
    serial: 'SN-122',
    orderCode: 'OP-1240',
    sampleSize: 180,
    findings: [],
    result: 'PASS',
    inspector: 'Ana López',
    notes: 'Producto conforme',
  },
  {
    id: 'i9',
    code: 'INSP-0009',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-WIP-0048',
    orderCode: 'OP-1241',
    machineCode: 'MACH-15',
    sampleSize: 90,
    findings: [
      { defectId: 'd3', qty: 3 },
      { defectId: 'd1', qty: 2 }
    ],
    result: 'PASS',
    inspector: 'Juan Pérez',
  },
  {
    id: 'i10',
    code: 'INSP-0010',
    type: 'INCOMING',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-MP-0003',
    sampleSize: 40,
    findings: [
      { defectId: 'd2', qty: 12, note: 'Alto número de roturas' }
    ],
    result: 'FAIL',
    inspector: 'María García',
    notes: 'Rechazado - lote defectuoso',
  },
  {
    id: 'i11',
    code: 'INSP-0011',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-FG-0123',
    serial: 'SN-123',
    orderCode: 'OP-1242',
    sampleSize: 200,
    findings: [
      { defectId: 'd4', qty: 2 }
    ],
    result: 'HOLD',
    inspector: 'Carlos Ruiz',
    notes: 'En espera - medidas críticas',
  },
  {
    id: 'i12',
    code: 'INSP-0012',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-WIP-0049',
    orderCode: 'OP-1243',
    machineCode: 'MACH-20',
    sampleSize: 110,
    findings: [],
    result: 'PASS',
    inspector: 'Ana López',
  },
];

const MOCK_INSPECTIONS_DUPLICATE: Inspection[] = [
  {
    id: 'i1',
    code: 'INSP-0001',
    type: 'INCOMING',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-MP-0001',
    serial: 'SN-001',
    orderCode: 'OP-1234',
    operation: 'Recepción MP',
    machineCode: 'REC-01',
    sampleSize: 50,
    findings: [
      { defectId: 'd1', qty: 2, note: 'Manchas menores' },
      { defectId: 'd3', qty: 1 }
    ],
    result: 'PASS',
    inspector: 'Juan Pérez',
    notes: 'Materia prima aceptable',
  },
  {
    id: 'i2',
    code: 'INSP-0002',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-WIP-0045',
    orderCode: 'OP-1235',
    operation: 'Proceso A',
    machineCode: 'MACH-05',
    sampleSize: 100,
    findings: [
      { defectId: 'd2', qty: 5, note: 'Roturas en bordes' },
      { defectId: 'd1', qty: 3 }
    ],
    result: 'FAIL',
    inspector: 'María García',
    notes: 'Lote rechazado - múltiples defectos',
  },
  {
    id: 'i3',
    code: 'INSP-0003',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-FG-0120',
    serial: 'SN-120',
    orderCode: 'OP-1236',
    operation: 'Inspección Final',
    sampleSize: 200,
    findings: [
      { defectId: 'd4', qty: 1, note: 'Medida crítica fuera de tolerancia' }
    ],
    result: 'HOLD',
    inspector: 'Carlos Ruiz',
    notes: 'En espera de revisión por medida crítica',
  },
  {
    id: 'i4',
    code: 'INSP-0004',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-WIP-0046',
    orderCode: 'OP-1237',
    operation: 'Proceso B',
    machineCode: 'MACH-12',
    sampleSize: 80,
    findings: [],
    result: 'PASS',
    inspector: 'Ana López',
    notes: 'Sin defectos encontrados',
  },
  {
    id: 'i5',
    code: 'INSP-0005',
    type: 'INCOMING',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-MP-0002',
    sampleSize: 60,
    findings: [
      { defectId: 'd3', qty: 8, note: 'Variación de color significativa' }
    ],
    result: 'FAIL',
    inspector: 'Juan Pérez',
    notes: 'Lote rechazado por color',
  },
  {
    id: 'i6',
    code: 'INSP-0006',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-FG-0121',
    serial: 'SN-121',
    orderCode: 'OP-1238',
    sampleSize: 150,
    findings: [
      { defectId: 'd1', qty: 1 }
    ],
    result: 'PASS',
    inspector: 'María García',
  },
  {
    id: 'i7',
    code: 'INSP-0007',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Noche',
    lotCode: 'LOT-WIP-0047',
    orderCode: 'OP-1239',
    operation: 'Proceso C',
    machineCode: 'MACH-08',
    sampleSize: 120,
    findings: [
      { defectId: 'd1', qty: 4 },
      { defectId: 'd2', qty: 2 }
    ],
    result: 'PASS',
    inspector: 'Carlos Ruiz',
  },
  {
    id: 'i8',
    code: 'INSP-0008',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Noche',
    lotCode: 'LOT-FG-0122',
    serial: 'SN-122',
    orderCode: 'OP-1240',
    sampleSize: 180,
    findings: [],
    result: 'PASS',
    inspector: 'Ana López',
    notes: 'Producto conforme',
  },
  {
    id: 'i9',
    code: 'INSP-0009',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-WIP-0048',
    orderCode: 'OP-1241',
    machineCode: 'MACH-15',
    sampleSize: 90,
    findings: [
      { defectId: 'd3', qty: 3 },
      { defectId: 'd1', qty: 2 }
    ],
    result: 'PASS',
    inspector: 'Juan Pérez',
  },
  {
    id: 'i10',
    code: 'INSP-0010',
    type: 'INCOMING',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-MP-0003',
    sampleSize: 40,
    findings: [
      { defectId: 'd2', qty: 12, note: 'Alto número de roturas' }
    ],
    result: 'FAIL',
    inspector: 'María García',
    notes: 'Rechazado - lote defectuoso',
  },
  {
    id: 'i11',
    code: 'INSP-0011',
    type: 'FINAL',
    date: '2025-01-03',
    shift: 'Mañana',
    lotCode: 'LOT-FG-0123',
    serial: 'SN-123',
    orderCode: 'OP-1242',
    sampleSize: 200,
    findings: [
      { defectId: 'd4', qty: 2 }
    ],
    result: 'HOLD',
    inspector: 'Carlos Ruiz',
    notes: 'En espera - medidas críticas',
  },
  {
    id: 'i12',
    code: 'INSP-0012',
    type: 'IN_PROCESS',
    date: '2025-01-03',
    shift: 'Tarde',
    lotCode: 'LOT-WIP-0049',
    orderCode: 'OP-1243',
    machineCode: 'MACH-20',
    sampleSize: 110,
    findings: [],
    result: 'PASS',
    inspector: 'Ana López',
  },
];

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  inspections: Inspection[] = MOCK_INSPECTIONS;
  selectedDate: string = '';
  dailyStats: DailyStats = {
    totalInspections: 0,
    passed: 0,
    failed: 0,
    hold: 0,
    passRate: 0,
    totalDefects: 0,
    criticalDefects: 0,
  };

  defectsByFamily: DefectByFamily[] = [];
  inspectionsByType: InspectionByType[] = [];
  recentInspections: any[] = [];
  topDefects: any[] = [];

  constructor(public qs: QualityStoreService) {}

  ngOnInit() {
  this.selectedDate = '2025-01-03'; // O usa new Date().toISOString().split('T')[0] para hoy
  this.loadDashboard();
}

  loadDashboard() {
    this.calculateDailyStats();
    this.calculateDefectsByFamily();
    this.calculateInspectionsByType();
    this.loadRecentInspections();
    this.calculateTopDefects();
  }

  calculateDailyStats() {
    const todayInspections = this.inspections.filter(
      (i) => i.date === this.selectedDate
    );

    this.dailyStats.totalInspections = todayInspections.length;
    this.dailyStats.passed = todayInspections.filter(
      (i) => i.result === 'PASS'
    ).length;
    this.dailyStats.failed = todayInspections.filter(
      (i) => i.result === 'FAIL'
    ).length;
    this.dailyStats.hold = todayInspections.filter(
      (i) => i.result === 'HOLD'
    ).length;
    this.dailyStats.passRate =
      this.dailyStats.totalInspections > 0
        ? (this.dailyStats.passed / this.dailyStats.totalInspections) * 100
        : 0;

    // Calcular total de defectos
    this.dailyStats.totalDefects = todayInspections.reduce(
      (sum, i) =>
        sum +
        (i.findings?.reduce((s: number, f: any) => s + (f.qty || 0), 0) || 0),
      0
    );

    // Defectos críticos (severidad CRITICAL)
    this.dailyStats.criticalDefects = todayInspections.reduce((sum, i) => {
      return (
        sum +
        (i.findings?.reduce((s: number, f: any) => {
          const defect = this.qs.defects.find((d) => d.id === f.defectId);
          const severity = this.qs.severities.find(
            (sev) => sev.id === defect?.severityId
          );
          return s + (severity?.level === 'CRITICAL' as any ? f.qty || 0 : 0);
        }, 0) || 0)
      );
    }, 0);
  }

  getTotalFindings(inspection: any): number {
  if (!inspection.findings || inspection.findings.length === 0) {
    return 0;
  }
  return inspection.findings.reduce((sum: number, finding: any) => sum + (finding.qty || 0), 0);
}

  calculateDefectsByFamily() {
    const familyMap = new Map<string, number>();
    const todayInspections = this.inspections.filter(
      (i) => i.date === this.selectedDate
    );

    todayInspections.forEach((inspection) => {
      inspection.findings?.forEach((finding: any) => {
        const defect = this.qs.defects.find((d) => d.id === finding.defectId);
        if (defect) {
          const family = this.qs.families.find((f) => f.id === defect.familyId);
          const familyName = family?.name || 'Sin familia';
          familyMap.set(
            familyName,
            (familyMap.get(familyName) || 0) + (finding.qty || 0)
          );
        }
      });
    });

    const total = Array.from(familyMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    this.defectsByFamily = Array.from(familyMap.entries())
      .map(([family, count]) => ({
        family,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  calculateInspectionsByType() {
    const todayInspections = this.inspections.filter(
      (i) => i.date === this.selectedDate
    );
    const typeMap = new Map<string, { passed: number; failed: number }>();

    todayInspections.forEach((inspection) => {
      const current = typeMap.get(inspection.type) || { passed: 0, failed: 0 };
      if (inspection.result === 'PASS') {
        current.passed++;
      } else if (inspection.result === 'FAIL') {
        current.failed++;
      }
      typeMap.set(inspection.type, current);
    });

    this.inspectionsByType = Array.from(typeMap.entries()).map(
      ([type, stats]) => ({
        type,
        count: stats.passed + stats.failed,
        passed: stats.passed,
        failed: stats.failed,
      })
    );
  }

  loadRecentInspections() {
    this.recentInspections = this.inspections
      .filter((i) => i.date === this.selectedDate)
      .slice(0, 10);
  }

  calculateTopDefects() {
    const defectMap = new Map<string, number>();
    const todayInspections = this.inspections.filter(
      (i) => i.date === this.selectedDate
    );

    todayInspections.forEach((inspection) => {
      inspection.findings?.forEach((finding: any) => {
        const defect = this.qs.defects.find((d) => d.id === finding.defectId);
        if (defect) {
          defectMap.set(
            defect.name,
            (defectMap.get(defect.name) || 0) + (finding.qty || 0)
          );
        }
      });
    });

    this.topDefects = Array.from(defectMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getBarWidth(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  onDateChange() {
    this.loadDashboard();
  }
}
