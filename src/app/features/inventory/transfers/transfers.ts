import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transfer {
  id: number;
  code: string;
  date: string;
  materialCode: string;
  materialName: string;
  materialType: 'RM' | 'WIP' | 'FG';
  lotCode?: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  uom: string;
  requestedBy: string;
  approvedBy?: string;
  movedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'app-transfers',
  imports: [CommonModule, FormsModule],
  templateUrl: './transfers.html',
  styleUrls: ['./transfers.css'],
})
export class TransfersComponent {
  transfers: Transfer[] = [
    {
      id: 1,
      code: 'TRF-2024-001',
      date: '2024-12-26',
      materialCode: 'RM-001',
      materialName: 'Acero Inoxidable 304',
      materialType: 'RM',
      lotCode: 'LOT-A-2024-123',
      fromLocation: 'A-01-01',
      toLocation: 'A-02-05',
      quantity: 100,
      uom: 'kg',
      requestedBy: 'Juan Pérez',
      approvedBy: 'Carlos López',
      movedBy: 'María García',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      notes: 'Transferencia para línea de producción 2',
    },
    {
      id: 2,
      code: 'TRF-2024-002',
      date: '2024-12-26',
      materialCode: 'FG-025',
      materialName: 'Producto Terminado X',
      materialType: 'FG',
      lotCode: 'LOT-FG-2024-045',
      fromLocation: 'PT-02-15',
      toLocation: 'SHIP-01',
      quantity: 50,
      uom: 'pcs',
      requestedBy: 'Ana Martínez',
      status: 'IN_TRANSIT',
      priority: 'HIGH',
      notes: 'Preparación para envío urgente',
    },
    {
      id: 3,
      code: 'TRF-2024-003',
      date: '2024-12-27',
      materialCode: 'WIP-012',
      materialName: 'Ensamble Parcial Y',
      materialType: 'WIP',
      fromLocation: 'WIP-01-10',
      toLocation: 'WIP-02-08',
      quantity: 25,
      uom: 'pcs',
      requestedBy: 'Roberto Silva',
      status: 'PENDING',
      priority: 'URGENT',
      notes: 'Transferencia entre estaciones de trabajo',
    },
  ];

  form: Partial<Transfer> = {
    materialType: 'RM',
    status: 'PENDING',
    priority: 'MEDIUM',
    uom: 'kg',
  };

  editingId: number | null = null;
  selectedTransfer: Transfer | null = null;

  // Filters
  q = '';
  filterStatus: string = 'ALL';
  filterPriority: string = 'ALL';
  filterMaterialType: string = 'ALL';

  get filtered() {
    let result = this.transfers;

    if (this.q) {
      const lower = this.q.toLowerCase();
      result = result.filter(
        (t) =>
          t.code.toLowerCase().includes(lower) ||
          t.materialCode.toLowerCase().includes(lower) ||
          t.materialName.toLowerCase().includes(lower) ||
          t.fromLocation.toLowerCase().includes(lower) ||
          t.toLocation.toLowerCase().includes(lower)
      );
    }

    if (this.filterStatus !== 'ALL') {
      result = result.filter((t) => t.status === this.filterStatus);
    }

    if (this.filterPriority !== 'ALL') {
      result = result.filter((t) => t.priority === this.filterPriority);
    }

    if (this.filterMaterialType !== 'ALL') {
      result = result.filter((t) => t.materialType === this.filterMaterialType);
    }

    return result.sort((a, b) => b.id - a.id);
  }

  submit() {
    if (!this.form.code || !this.form.materialCode || !this.form.fromLocation || !this.form.toLocation || !this.form.quantity) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (this.editingId) {
      const index = this.transfers.findIndex((t) => t.id === this.editingId);
      if (index !== -1) {
        this.transfers[index] = { ...this.transfers[index], ...this.form } as Transfer;
      }
      this.editingId = null;
    } else {
      const newTransfer: Transfer = {
        id: Math.max(...this.transfers.map((t) => t.id), 0) + 1,
        code: this.form.code!,
        date: this.form.date || new Date().toISOString().split('T')[0],
        materialCode: this.form.materialCode!,
        materialName: this.form.materialName || '',
        materialType: this.form.materialType!,
        lotCode: this.form.lotCode,
        fromLocation: this.form.fromLocation!,
        toLocation: this.form.toLocation!,
        quantity: this.form.quantity!,
        uom: this.form.uom!,
        requestedBy: this.form.requestedBy || 'Usuario Actual',
        approvedBy: this.form.approvedBy,
        movedBy: this.form.movedBy,
        status: this.form.status!,
        priority: this.form.priority!,
        notes: this.form.notes,
      };
      this.transfers.push(newTransfer);
    }

    this.resetForm();
  }

  selectTransfer(transfer: Transfer) {
    this.selectedTransfer = transfer;
  }

  editTransfer(transfer: Transfer) {
    this.form = { ...transfer };
    this.editingId = transfer.id;
  }

  cancelEdit() {
    this.resetForm();
  }

  remove(id: number) {
    if (confirm('¿Eliminar esta transferencia?')) {
      this.transfers = this.transfers.filter((t) => t.id !== id);
      if (this.selectedTransfer?.id === id) {
        this.selectedTransfer = null;
      }
    }
  }

  resetForm() {
    this.form = {
      materialType: 'RM',
      status: 'PENDING',
      priority: 'MEDIUM',
      uom: 'kg',
    };
    this.editingId = null;
  }

  getStatusBadge(status: string) {
    const badges: Record<string, string> = {
      PENDING: 'ui-badge text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
      APPROVED: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      IN_TRANSIT: 'ui-badge text-purple-300 bg-purple-500/10 border-purple-500/20',
      COMPLETED: 'ui-badge-ok',
      CANCELLED: 'ui-badge-bad',
    };
    return badges[status] || 'ui-badge';
  }

  getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      IN_TRANSIT: 'En Tránsito',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }

  getPriorityBadge(priority: string) {
    const badges: Record<string, string> = {
      LOW: 'ui-badge text-gray-300 bg-gray-500/10 border-gray-500/20',
      MEDIUM: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      HIGH: 'ui-badge text-orange-300 bg-orange-500/10 border-orange-500/20',
      URGENT: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20',
    };
    return badges[priority] || 'ui-badge';
  }

  getPriorityLabel(priority: string) {
    const labels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
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
      RM: 'MP',
      WIP: 'WIP',
      FG: 'PT',
    };
    return labels[type] || type;
  }
}
