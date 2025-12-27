import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CountLine {
  materialCode: string;
  materialName: string;
  location: string;
  systemQty: number;
  countedQty: number;
  variance: number;
  variancePercent: number;
  uom: string;
}

interface CyclicCount {
  id: number;
  code: string;
  date: string;
  type: 'FULL' | 'PARTIAL' | 'SPOT';
  zone?: string;
  location?: string;
  countedBy: string;
  verifiedBy?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'ADJUSTED';
  totalItems: number;
  itemsCounted: number;
  variancesFound: number;
  lines: CountLine[];
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'app-counts',
  imports: [CommonModule, FormsModule],
  templateUrl: './counts.html',
  styleUrls: ['./counts.css'],
})
export class CountsComponent {
  counts: CyclicCount[] = [
    {
      id: 1,
      code: 'CC-2024-001',
      date: '2024-12-26',
      type: 'PARTIAL',
      zone: 'Zona A',
      location: 'A-01',
      countedBy: 'Juan Pérez',
      verifiedBy: 'Carlos López',
      status: 'COMPLETED',
      totalItems: 5,
      itemsCounted: 5,
      variancesFound: 2,
      lines: [
        { materialCode: 'RM-001', materialName: 'Acero Inoxidable 304', location: 'A-01-01', systemQty: 350, countedQty: 348, variance: -2, variancePercent: -0.57, uom: 'kg' },
        { materialCode: 'RM-002', materialName: 'Aluminio 6061', location: 'A-01-02', systemQty: 200, countedQty: 200, variance: 0, variancePercent: 0, uom: 'kg' },
        { materialCode: 'RM-003', materialName: 'Plástico ABS', location: 'A-01-03', systemQty: 150, countedQty: 155, variance: 5, variancePercent: 3.33, uom: 'kg' },
      ],
      notes: 'Conteo semanal de zona A',
    },
    {
      id: 2,
      code: 'CC-2024-002',
      date: '2024-12-27',
      type: 'SPOT',
      location: 'PT-02-15',
      countedBy: 'María García',
      status: 'IN_PROGRESS',
      totalItems: 2,
      itemsCounted: 1,
      variancesFound: 0,
      lines: [
        { materialCode: 'FG-025', materialName: 'Producto Terminado X', location: 'PT-02-15', systemQty: 200, countedQty: 200, variance: 0, variancePercent: 0, uom: 'pcs' },
      ],
      notes: 'Conteo aleatorio de producto terminado',
    },
  ];

  selectedCount: CyclicCount | null = null;

  // Filters
  q = '';
  filterType: string = 'ALL';
  filterStatus: string = 'ALL';
  filterZone: string = 'ALL';

  get filtered() {
    let result = this.counts;

    if (this.q) {
      const lower = this.q.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(lower) ||
          (c.zone && c.zone.toLowerCase().includes(lower)) ||
          (c.location && c.location.toLowerCase().includes(lower))
      );
    }

    if (this.filterType !== 'ALL') {
      result = result.filter((c) => c.type === this.filterType);
    }

    if (this.filterStatus !== 'ALL') {
      result = result.filter((c) => c.status === this.filterStatus);
    }

    if (this.filterZone !== 'ALL') {
      result = result.filter((c) => c.zone === this.filterZone);
    }

    return result.sort((a, b) => b.id - a.id);
  }

  get uniqueZones() {
    return Array.from(new Set(this.counts.map((c) => c.zone).filter(Boolean))) as string[];
  }

  selectCount(count: CyclicCount) {
    this.selectedCount = count;
  }

  getTypeBadge(type: string) {
    const badges: Record<string, string> = {
      FULL: 'ui-badge text-purple-300 bg-purple-500/10 border-purple-500/20',
      PARTIAL: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      SPOT: 'ui-badge text-amber-300 bg-amber-500/10 border-amber-500/20',
    };
    return badges[type] || 'ui-badge';
  }

  getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      FULL: 'Completo',
      PARTIAL: 'Parcial',
      SPOT: 'Aleatorio',
    };
    return labels[type] || type;
  }

  getStatusBadge(status: string) {
    const badges: Record<string, string> = {
      PLANNED: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20',
      IN_PROGRESS: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      COMPLETED: 'ui-badge-ok',
      REVIEWED: 'ui-badge text-purple-300 bg-purple-500/10 border-purple-500/20',
      ADJUSTED: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
    };
    return badges[status] || 'ui-badge';
  }

  getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      PLANNED: 'Planeado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      REVIEWED: 'Revisado',
      ADJUSTED: 'Ajustado',
    };
    return labels[status] || status;
  }

  getVarianceBadge(variance: number) {
    if (variance === 0) return 'text-slate-400';
    if (variance > 0) return 'text-green-400';
    return 'text-red-400';
  }

  getAccuracy(count: CyclicCount) {
    if (count.itemsCounted === 0) return 0;
    const accurate = count.itemsCounted - count.variancesFound;
    return (accurate / count.itemsCounted) * 100;
  }
}
