import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
})
export class HistoryComponent {
  assetCode = '';
  filterType: 'ALL' | 'WO' | 'DT' | 'INT' = 'ALL';
  filterFrom = '';
  filterTo = '';
  page = 1;
  pageSize = 20;

  constructor(public ms: MaintenanceStoreService) {
    this.assetCode = ms.assets[0]?.code ?? '';
  }

  get assets() { return this.ms.assets; }

  get rawData() {
    return this.ms.historyForAsset(this.assetCode);
  }

  get filteredRows() {
    return this.rawData.rows.filter(r => {
      if (this.filterType !== 'ALL' && r.type !== this.filterType) return false;
      const t = new Date(r.at).getTime();
      if (this.filterFrom && t < new Date(this.filterFrom).getTime()) return false;
      if (this.filterTo && t > new Date(this.filterTo + 'T23:59:59').getTime()) return false;
      return true;
    });
  }

  get pagedRows() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  prevPage() { if (this.page > 1) this.page--; }
  nextPage() { if (this.page < this.totalPages) this.page++; }
  onFilterChange() { this.page = 1; }

  clearFilters() {
    this.filterType = 'ALL';
    this.filterFrom = '';
    this.filterTo = '';
    this.page = 1;
  }

  exportCsv() {
    const rows = [
      ['Fecha', 'Tipo', 'Título', 'Detalle'],
      ...this.filteredRows.map(r => [r.at, r.type, r.title, r.meta]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-${this.assetCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  badgeType(t: string) {
    if (t === 'WO') return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-0.5 text-[11px]';
    if (t === 'DT') return 'bg-rose-500/10 text-rose-200 border border-rose-500/20 rounded-full px-2 py-0.5 text-[11px]';
    return 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-0.5 text-[11px]';
  }

  typeLabel(t: string) {
    if (t === 'WO') return 'Orden de Trabajo';
    if (t === 'DT') return 'Parada';
    return 'Intervención';
  }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
