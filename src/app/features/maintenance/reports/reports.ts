import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent {
  section: 'OVERVIEW' | 'WO' | 'DOWNTIME' | 'PM' | 'INVENTORY' = 'OVERVIEW';
  tabs: { id: string; icon: string; label: string }[] = [
    { id: 'OVERVIEW', icon: 'pi-th-large', label: 'Resumen' },
    { id: 'WO', icon: 'pi-clipboard', label: 'OTs' },
    { id: 'DOWNTIME', icon: 'pi-stop-circle', label: 'Paradas' },
    { id: 'PM', icon: 'pi-calendar', label: 'Preventivos' },
    { id: 'INVENTORY', icon: 'pi-box', label: 'Inventario' },
  ];

  constructor(public ms: MaintenanceStoreService) {}

  setSection(id: string) {
    this.section = id as 'OVERVIEW' | 'WO' | 'DOWNTIME' | 'PM' | 'INVENTORY';
  }

  get wos() { return this.ms.workOrders; }
  get dts() { return this.ms.downtimes; }
  get plans() { return this.ms.plans; }
  get spares() { return this.ms.spares; }
  get txns() { return this.ms.inventoryTxns; }
  get interventions() { return this.ms.interventions; }

  // ---- WO KPIs ----
  get woByStatus(): { label: string; value: number; color: string }[] {
    const m: Record<string, string> = {
      OPEN: 'text-amber-400', PLANNED: 'text-blue-400', IN_PROGRESS: 'text-emerald-400',
      ON_HOLD: 'text-slate-400', DONE: 'text-teal-400', CLOSED: 'text-slate-500', CANCELLED: 'text-red-400',
    };
    const counts: Record<string, number> = {};
    this.wos.forEach(w => { counts[w.status] = (counts[w.status] ?? 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      label: this.statusLabel(status), value, color: m[status] ?? 'text-slate-400',
    })).sort((a, b) => b.value - a.value);
  }

  get woByType(): { label: string; value: number; pct: number }[] {
    const total = this.wos.length || 1;
    const counts: Record<string, number> = {};
    this.wos.forEach(w => { counts[w.type] = (counts[w.type] ?? 0) + 1; });
    return Object.entries(counts).map(([type, value]) => ({
      label: this.typeLabel(type), value, pct: Math.round((value / total) * 100),
    })).sort((a, b) => b.value - a.value);
  }

  get mttr(): string {
    const closed = this.wos.filter(w => w.closedAt);
    if (!closed.length) return '—';
    const total = closed.reduce((acc, w) => {
      const diff = new Date(w.closedAt!).getTime() - new Date(w.createdAt).getTime();
      return acc + diff / 60000;
    }, 0);
    return (total / closed.length / 60).toFixed(1);
  }

  get totalDowntimeHrs(): string {
    const total = this.dts.reduce((acc, d) => acc + (d.minutes ?? 0), 0);
    return (total / 60).toFixed(1);
  }

  get availabilityPct(): string {
    const possibleMin = this.ms.assets.length * 30 * 24 * 60;
    const totalMin = this.dts.reduce((acc, d) => acc + (d.minutes ?? 0), 0);
    return possibleMin > 0 ? (100 - (totalMin / possibleMin) * 100).toFixed(2) : '100.00';
  }

  get downtimeByReason(): { reason: string; min: number; hrs: string; pct: number }[] {
    const totalMin = this.dts.reduce((acc, d) => acc + (d.minutes ?? 0), 0) || 1;
    const counts: Record<string, number> = {};
    this.dts.forEach(d => { counts[d.reason] = (counts[d.reason] ?? 0) + (d.minutes ?? 0); });
    return Object.entries(counts)
      .map(([reason, min]) => ({ reason: this.reasonLabel(reason), min, hrs: (min / 60).toFixed(1), pct: Math.round((min / totalMin) * 100) }))
      .sort((a, b) => b.min - a.min);
  }

  get pmKpis() {
    const now = Date.now();
    const total = this.plans.length;
    const active = this.plans.filter(p => p.active).length;
    const overdue = this.plans.filter(p => p.active && new Date(p.nextAt).getTime() < now).length;
    const compliant = active > 0 ? Math.round(((active - overdue) / active) * 100) : 100;
    return { total, active, overdue, compliant };
  }

  get overdueCount() {
    return this.plans.filter(p => p.active && new Date(p.nextAt).getTime() < Date.now()).length;
  }

  get inventoryKpis() { return this.ms.inventoryKpis(); }

  get outTxnsBySpare(): { code: string; name: string; qty: number; uom: string }[] {
    const m: Record<string, number> = {};
    this.txns.filter(t => t.type === 'OUT').forEach(t => { m[t.spareCode] = (m[t.spareCode] ?? 0) + t.qty; });
    return Object.entries(m).map(([code, qty]) => {
      const spare = this.ms.spareByCode(code);
      return { code, name: spare?.name ?? code, qty, uom: spare?.uom ?? '' };
    }).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }

  get lowStockSpares() {
    return this.spares.filter(s => s.isActive && s.stock <= s.minStock);
  }

  // ---- Labels ----
  reasonLabel(r: string) {
    const m: Record<string, string> = {
      MECHANICAL: 'Mecánica', ELECTRICAL: 'Eléctrica', SETUP: 'Setup',
      QUALITY: 'Calidad', MATERIAL: 'Material', SAFETY: 'Seguridad', PLANNED: 'Planificada', OTHER: 'Otra',
    };
    return m[r] ?? r;
  }

  typeLabel(t: string) {
    const m: Record<string, string> = {
      CORRECTIVE: 'Correctivo', PREVENTIVE: 'Preventivo', INSPECTION: 'Inspección', CALIBRATION: 'Calibración',
    };
    return m[t] ?? t;
  }

  statusLabel(s: string) {
    const m: Record<string, string> = {
      OPEN: 'Abierta', PLANNED: 'Planificada', IN_PROGRESS: 'En progreso',
      ON_HOLD: 'En espera', DONE: 'Hecha', CLOSED: 'Cerrada', CANCELLED: 'Cancelada',
    };
    return m[s] ?? s;
  }

  freqLabel(f: string) {
    const m: Record<string, string> = {
      WEEKLY: 'Semanal', MONTHLY: 'Mensual', QUARTERLY: 'Trimestral', SEMIANNUAL: 'Semestral', ANNUAL: 'Anual',
    };
    return m[f] ?? f;
  }

  isOverdue(iso: string) { return new Date(iso).getTime() < Date.now(); }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  exportWosCsv() {
    const rows = [
      ['Código', 'Tipo', 'Estado', 'Prioridad', 'Activo', 'Asignado', 'Creado', 'Cerrado'],
      ...this.wos.map(w => [w.code, this.typeLabel(w.type), this.statusLabel(w.status), w.priority, w.assetName, w.assignedTo ?? '', w.createdAt, w.closedAt ?? '']),
    ];
    this.downloadCsv(rows, 'ots-mantenimiento.csv');
  }

  exportDtCsv() {
    const rows = [
      ['Código', 'Activo', 'Razón', 'Inicio', 'Fin', 'Minutos', 'Reportado por'],
      ...this.dts.map(d => [d.code, d.assetName, this.reasonLabel(d.reason), d.startAt, d.endAt ?? '', String(d.minutes ?? ''), d.reportedBy]),
    ];
    this.downloadCsv(rows, 'paradas-mantenimiento.csv');
  }

  private downloadCsv(rows: string[][], filename: string) {
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
