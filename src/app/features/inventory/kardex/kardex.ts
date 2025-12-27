import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface KardexRecord {
  id: number;
  date: string;
  movementCode: string;
  type: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT';
  documentRef?: string;
  quantityIn: number;
  quantityOut: number;
  balance: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

interface MaterialKardex {
  materialCode: string;
  materialName: string;
  materialType: 'RM' | 'WIP' | 'FG';
  lotCode?: string;
  location: string;
  uom: string;
  currentBalance: number;
  currentValue: number;
  averageUnitCost: number;
  records: KardexRecord[];
}

@Component({
  standalone: true,
  selector: 'app-kardex',
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex.html',
  styleUrls: ['./kardex.css'],
})
export class KardexComponent {
  kardexes: MaterialKardex[] = [
    {
      materialCode: 'RM-001',
      materialName: 'Acero Inoxidable 304',
      materialType: 'RM',
      lotCode: 'LOT-A-2024-123',
      location: 'A-01-01',
      uom: 'kg',
      currentBalance: 350,
      currentValue: 175000,
      averageUnitCost: 500,
      records: [
        {
          id: 1,
          date: '2024-12-20',
          movementCode: 'MOV-001',
          type: 'RECEIPT',
          documentRef: 'PO-2024-045',
          quantityIn: 500,
          quantityOut: 0,
          balance: 500,
          unitCost: 500,
          totalCost: 250000,
          notes: 'Recepción inicial',
        },
        {
          id: 2,
          date: '2024-12-26',
          movementCode: 'MOV-002',
          type: 'ISSUE',
          documentRef: 'WO-2024-089',
          quantityIn: 0,
          quantityOut: 150,
          balance: 350,
          unitCost: 500,
          totalCost: -75000,
          notes: 'Salida para producción',
        },
      ],
    },
    {
      materialCode: 'FG-025',
      materialName: 'Producto Terminado X',
      materialType: 'FG',
      lotCode: 'LOT-FG-2024-045',
      location: 'PT-02-15',
      uom: 'pcs',
      currentBalance: 200,
      currentValue: 280000,
      averageUnitCost: 1400,
      records: [
        {
          id: 1,
          date: '2024-12-26',
          movementCode: 'MOV-003',
          type: 'RECEIPT',
          documentRef: 'WO-2024-089',
          quantityIn: 200,
          quantityOut: 0,
          balance: 200,
          unitCost: 1400,
          totalCost: 280000,
          notes: 'Entrada desde producción',
        },
      ],
    },
  ];

  selectedKardex: MaterialKardex | null = null;

  // Filters
  q = '';
  filterMaterialType: string = 'ALL';
  filterLocation: string = 'ALL';

  get filtered() {
    let result = this.kardexes;

    if (this.q) {
      const lower = this.q.toLowerCase();
      result = result.filter(
        (k) =>
          k.materialCode.toLowerCase().includes(lower) ||
          k.materialName.toLowerCase().includes(lower) ||
          (k.lotCode && k.lotCode.toLowerCase().includes(lower))
      );
    }

    if (this.filterMaterialType !== 'ALL') {
      result = result.filter((k) => k.materialType === this.filterMaterialType);
    }

    if (this.filterLocation !== 'ALL') {
      result = result.filter((k) => k.location === this.filterLocation);
    }

    return result;
  }

  get uniqueLocations() {
    return Array.from(new Set(this.kardexes.map((k) => k.location)));
  }

  selectKardex(kardex: MaterialKardex) {
    this.selectedKardex = kardex;
  }

  getMaterialTypeBadge(type: string) {
    const badges: Record<string, string> = {
      RM: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      WIP: 'ui-badge text-amber-300 bg-amber-500/10 border-amber-500/20',
      FG: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
    };
    return badges[type] || 'ui-badge';
  }

  getMaterialTypeLabel(type: string) {
    const labels: Record<string, string> = {
      RM: 'Materia Prima',
      WIP: 'En Proceso',
      FG: 'Producto Terminado',
    };
    return labels[type] || type;
  }

  getMovementTypeBadge(type: string) {
    const badges: Record<string, string> = {
      RECEIPT: 'ui-badge-ok',
      ISSUE: 'ui-badge-warn',
      ADJUSTMENT: 'ui-badge',
    };
    return badges[type] || 'ui-badge';
  }

  getMovementTypeLabel(type: string) {
    const labels: Record<string, string> = {
      RECEIPT: 'Entrada',
      ISSUE: 'Salida',
      ADJUSTMENT: 'Ajuste',
    };
    return labels[type] || type;
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  }
}
