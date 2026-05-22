import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeasibilityService, HistoryRecord } from '../feasibility.service';

@Component({
  standalone: true,
  selector: 'app-feasibility-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
})
export class FeasibilityHistoryComponent implements OnInit {
  q = '';
  filterType = '';

  items: HistoryRecord[] = [];
  loading = false;

  // Paginación
  currentPage = 1;
  readonly limit = 10;
  total = 0;
  get totalPages() { return Math.ceil(this.total / this.limit) || 1; }

  // Stats calculadas del total (basadas en la página actual, se actualizan con toda la carga)
  allItems: HistoryRecord[] = []; // cache para los contadores de resumen

  // Modal de detalle
  selectedRecord: HistoryRecord | null = null;

  openDetail(r: HistoryRecord) { this.selectedRecord = r; }
  closeDetail() { this.selectedRecord = null; }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeDetail(); }

  constructor(private svc: FeasibilityService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load(page = this.currentPage) {
    this.loading = true;
    this.svc.getHistory(page, this.limit, this.q.trim() || undefined, this.filterType || undefined)
      .subscribe({
        next: r => {
          this.items = r.data;
          this.total = r.total;
          this.currentPage = r.page;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); },
      });
  }

  onSearch()      { this.load(1); }
  onFilterChange(){ this.load(1); }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.load(page);
  }

  get filtered(): HistoryRecord[] { return this.items; }

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
      case 'COMPLETED':   return 'Completado';
      case 'CANCELLED':   return 'Cancelado';
      default: return val;
    }
  }

  statusColor(val: string): string {
    switch (val) {
      case 'IN_PROGRESS': return 'text-blue-400';
      case 'COMPLETED':   return 'text-emerald-400';
      case 'CANCELLED':   return 'text-rose-400';
      default: return 'text-slate-400';
    }
  }
}
