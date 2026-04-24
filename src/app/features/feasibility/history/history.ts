import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HistoryRecord {
  id: string;
  studyCode: string;
  clientName: string;
  productName: string;
  quantity: number;
  uom: string;
  approvedDate: string;
  approvedBy: string;
  quotePrice: number;
  currency: string;
  resultType: 'PRODUCTION_ORDER' | 'PURCHASE_REQUEST';
  resultCode: string;
  resultDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

@Component({
  standalone: true,
  selector: 'app-feasibility-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
})
export class FeasibilityHistoryComponent {
  q = '';
  filterType = '';

  items: HistoryRecord[] = [
    {
      id: '1', studyCode: 'FAC-0001', clientName: 'Textiles del Pacífico S.A.',
      productName: 'Tela Jersey 30/1 algodón', quantity: 5000, uom: 'metros',
      approvedDate: '2026-04-05', approvedBy: 'Ing. Martínez',
      quotePrice: 8393.75, currency: 'USD',
      resultType: 'PRODUCTION_ORDER', resultCode: 'OP-2026-0087',
      resultDate: '2026-04-06', status: 'IN_PROGRESS',
    },
    {
      id: '2', studyCode: 'FAC-0003', clientName: 'Deportivos ProFit S.A.S.',
      productName: 'Malla deportiva dry-fit', quantity: 8000, uom: 'metros',
      approvedDate: '2026-04-12', approvedBy: 'Ing. Rodríguez',
      quotePrice: 11069.5, currency: 'USD',
      resultType: 'PRODUCTION_ORDER', resultCode: 'OP-2026-0092',
      resultDate: '2026-04-13', status: 'IN_PROGRESS',
    },
    {
      id: '3', studyCode: 'FAC-0098', clientName: 'Hogar & Diseño Ltda.',
      productName: 'Tela cortina blackout', quantity: 1200, uom: 'metros',
      approvedDate: '2026-03-15', approvedBy: 'Ing. Martínez',
      quotePrice: 4560.0, currency: 'USD',
      resultType: 'PURCHASE_REQUEST', resultCode: 'SP-2026-0034',
      resultDate: '2026-03-16', status: 'COMPLETED',
    },
    {
      id: '4', studyCode: 'FAC-0085', clientName: 'Ropa Kids Colombia',
      productName: 'Franela algodón 20/1', quantity: 6000, uom: 'metros',
      approvedDate: '2026-03-02', approvedBy: 'Ing. López',
      quotePrice: 7200.0, currency: 'USD',
      resultType: 'PRODUCTION_ORDER', resultCode: 'OP-2026-0071',
      resultDate: '2026-03-03', status: 'COMPLETED',
    },
    {
      id: '5', studyCode: 'FAC-0072', clientName: 'Industrias Marítimas S.A.',
      productName: 'Lona poliéster 600D', quantity: 2500, uom: 'metros',
      approvedDate: '2026-02-20', approvedBy: 'Ing. Rodríguez',
      quotePrice: 9875.0, currency: 'USD',
      resultType: 'PURCHASE_REQUEST', resultCode: 'SP-2026-0028',
      resultDate: '2026-02-21', status: 'CANCELLED',
    },
  ];

  get filtered(): HistoryRecord[] {
    let list = this.items;
    if (this.filterType) list = list.filter(x => x.resultType === this.filterType);
    const t = this.q.trim().toLowerCase();
    if (t) {
      list = list.filter(x =>
        [x.studyCode, x.clientName, x.productName, x.resultCode]
          .some(v => (v || '').toLowerCase().includes(t))
      );
    }
    return list;
  }

  resultTypeLabel(val: string): string {
    return val === 'PRODUCTION_ORDER' ? 'Orden de Producción' : 'Solicitud de Pedido';
  }

  countByType(type: string): number {
    return this.items.filter(x => x.resultType === type).length;
  }

  countByStatus(status: string): number {
    return this.items.filter(x => x.status === status).length;
  }

  resultTypeBadge(val: string): string {
    return val === 'PRODUCTION_ORDER'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      : 'bg-violet-500/10 text-violet-400 border-violet-500/30';
  }

  statusLabel(val: string): string {
    switch (val) {
      case 'IN_PROGRESS': return 'En progreso';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return val;
    }
  }

  statusColor(val: string): string {
    switch (val) {
      case 'IN_PROGRESS': return 'text-blue-400';
      case 'COMPLETED': return 'text-emerald-400';
      case 'CANCELLED': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  }
}
