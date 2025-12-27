import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InventoryMovement {
  id: number;
  code: string;
  date: string;
  type: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
  materialCode: string;
  materialName: string;
  materialType: 'RM' | 'WIP' | 'FG'; // Raw Material, Work In Progress, Finished Good
  lotCode?: string;
  locationFrom?: string;
  locationTo?: string;
  quantity: number;
  uom: string;
  referenceDoc?: string;
  referenceType?: 'PO' | 'WO' | 'SO' | 'TO' | 'ADJ';
  reason?: string;
  username: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'app-movements',
  imports: [CommonModule, FormsModule],
  templateUrl: './movements.html',
  styleUrls: ['./movements.css'],
})
export class MovementsComponent {
  movements: InventoryMovement[] = [
    {
      id: 1,
      code: 'MOV-2024-001',
      date: '2024-12-26',
      type: 'RECEIPT',
      materialCode: 'RM-001',
      materialName: 'Acero Inoxidable 304',
      materialType: 'RM',
      lotCode: 'LOT-A-2024-123',
      locationTo: 'A-01-01',
      quantity: 500,
      uom: 'kg',
      referenceDoc: 'PO-2024-045',
      referenceType: 'PO',
      username: 'Juan Pérez',
      status: 'COMPLETED',
      notes: 'Recepción de materia prima',
    },
    {
      id: 2,
      code: 'MOV-2024-002',
      date: '2024-12-26',
      type: 'ISSUE',
      materialCode: 'RM-001',
      materialName: 'Acero Inoxidable 304',
      materialType: 'RM',
      lotCode: 'LOT-A-2024-123',
      locationFrom: 'A-01-01',
      quantity: 150,
      uom: 'kg',
      referenceDoc: 'WO-2024-089',
      referenceType: 'WO',
      username: 'María García',
      status: 'COMPLETED',
      notes: 'Salida para producción',
    },
    {
      id: 3,
      code: 'MOV-2024-003',
      date: '2024-12-26',
      type: 'RECEIPT',
      materialCode: 'FG-025',
      materialName: 'Producto Terminado X',
      materialType: 'FG',
      lotCode: 'LOT-FG-2024-045',
      locationTo: 'PT-02-15',
      quantity: 200,
      uom: 'pcs',
      referenceDoc: 'WO-2024-089',
      referenceType: 'WO',
      username: 'Carlos López',
      status: 'COMPLETED',
      notes: 'Entrada de producto terminado desde producción',
    },
  ];

  form: Partial<InventoryMovement> = {
    type: 'RECEIPT',
    materialType: 'RM',
    status: 'PENDING',
    uom: 'kg',
  };

  editingId: number | null = null;
  selectedMovement: InventoryMovement | null = null;

  // Filters
  q = '';
  filterType: string = 'ALL';
  filterMaterialType: string = 'ALL';
  filterStatus: string = 'ALL';
  filterDate: string = '';

  get filtered() {
    let result = this.movements;

    if (this.q) {
      const lower = this.q.toLowerCase();
      result = result.filter(
        (m) =>
          m.code.toLowerCase().includes(lower) ||
          m.materialCode.toLowerCase().includes(lower) ||
          m.materialName.toLowerCase().includes(lower) ||
          (m.lotCode && m.lotCode.toLowerCase().includes(lower))
      );
    }

    if (this.filterType !== 'ALL') {
      result = result.filter((m) => m.type === this.filterType);
    }

    if (this.filterMaterialType !== 'ALL') {
      result = result.filter((m) => m.materialType === this.filterMaterialType);
    }

    if (this.filterStatus !== 'ALL') {
      result = result.filter((m) => m.status === this.filterStatus);
    }

    if (this.filterDate) {
      result = result.filter((m) => m.date === this.filterDate);
    }

    return result.sort((a, b) => b.id - a.id);
  }

  submit() {
    if (!this.form.code || !this.form.materialCode || !this.form.quantity) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (this.editingId) {
      const index = this.movements.findIndex((m) => m.id === this.editingId);
      if (index !== -1) {
        this.movements[index] = { ...this.movements[index], ...this.form } as InventoryMovement;
      }
      this.editingId = null;
    } else {
      const newMovement: InventoryMovement = {
        id: Math.max(...this.movements.map((m) => m.id), 0) + 1,
        code: this.form.code!,
        date: this.form.date || new Date().toISOString().split('T')[0],
        type: this.form.type!,
        materialCode: this.form.materialCode!,
        materialName: this.form.materialName || '',
        materialType: this.form.materialType!,
        lotCode: this.form.lotCode,
        locationFrom: this.form.locationFrom,
        locationTo: this.form.locationTo,
        quantity: this.form.quantity!,
        uom: this.form.uom!,
        referenceDoc: this.form.referenceDoc,
        referenceType: this.form.referenceType,
        reason: this.form.reason,
        username: this.form.username || 'Usuario Actual',
        status: this.form.status!,
        notes: this.form.notes,
      };
      this.movements.push(newMovement);
    }

    this.resetForm();
  }

  selectMovement(movement: InventoryMovement) {
    this.selectedMovement = movement;
  }

  editMovement(movement: InventoryMovement) {
    this.form = { ...movement };
    this.editingId = movement.id;
  }

  cancelEdit() {
    this.resetForm();
  }

  remove(id: number) {
    if (confirm('¿Eliminar este movimiento?')) {
      this.movements = this.movements.filter((m) => m.id !== id);
      if (this.selectedMovement?.id === id) {
        this.selectedMovement = null;
      }
    }
  }

  resetForm() {
    this.form = {
      type: 'RECEIPT',
      materialType: 'RM',
      status: 'PENDING',
      uom: 'kg',
    };
    this.editingId = null;
  }

  getTypeBadge(type: string) {
    const badges: Record<string, string> = {
      RECEIPT: 'ui-badge-ok',
      ISSUE: 'ui-badge-warn',
      ADJUSTMENT: 'ui-badge',
      TRANSFER: 'ui-badge',
      RETURN: 'ui-badge-bad',
    };
    return badges[type] || 'ui-badge';
  }

  getStatusBadge(status: string) {
    const badges: Record<string, string> = {
      PENDING: 'ui-badge-warn',
      COMPLETED: 'ui-badge-ok',
      CANCELLED: 'ui-badge-bad',
    };
    return badges[status] || 'ui-badge';
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

  getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      RECEIPT: 'Entrada',
      ISSUE: 'Salida',
      ADJUSTMENT: 'Ajuste',
      TRANSFER: 'Transferencia',
      RETURN: 'Devolución',
    };
    return labels[type] || type;
  }

  getReferenceTypeLabel(type?: string) {
    if (!type) return '';
    const labels: Record<string, string> = {
      PO: 'Orden de Compra',
      WO: 'Orden de Trabajo',
      SO: 'Orden de Venta',
      TO: 'Orden de Transferencia',
      ADJ: 'Ajuste',
    };
    return labels[type] || type;
  }
}
