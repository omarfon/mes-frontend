import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaintenanceStoreService, WorkOrderStatus, WorkOrderPriority } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  constructor(public ms: MaintenanceStoreService, private router: Router) {}

  get kpis() { return this.ms.kpis(); }
  get dtKpis() { return this.ms.downtimeKpis(); }
  get invKpis() { return this.ms.inventoryKpis(); }

  get recentWos() { return this.ms.workOrders.slice(0, 5); }

  get openDowntimes() { return this.ms.downtimes.filter(d => !d.endAt); }

  get availabilityPct() {
    const totalMin = this.dtKpis.totalMin;
    const totalPossible = this.ms.assets.length * 30 * 24 * 60;
    return totalPossible > 0 ? (100 - (totalMin / totalPossible) * 100).toFixed(1) : '100.0';
  }

  get upcomingPMs() {
    return this.ms.plans
      .filter(p => p.active)
      .sort((a, b) => new Date(a.nextAt).getTime() - new Date(b.nextAt).getTime())
      .slice(0, 5);
  }

  get assetHealth() {
    return this.ms.assets.map(a => {
      const openWos = this.ms.workOrders.filter(w => w.assetCode === a.code && ['OPEN','IN_PROGRESS'].includes(w.status)).length;
      const openDt = this.ms.downtimes.filter(d => d.assetCode === a.code && !d.endAt).length;
      const score = Math.max(0, 100 - openWos * 20 - openDt * 30);
      const status = score >= 80 ? 'GOOD' : score >= 50 ? 'WARNING' : 'CRITICAL';
      return { ...a, score, status };
    });
  }

  navTo(path: string) {
    const segments = path.split('/').filter(Boolean);
    this.router.navigate(['/maintenance', ...segments]);
  }

  priorityBadge(p: WorkOrderPriority | string) {
    const m: Record<string, string> = {
      CRITICAL: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      HIGH: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      MEDIUM: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      LOW: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    };
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ' + (m[p] ?? '');
  }

  statusBadge(s: WorkOrderStatus | string) {
    const m: Record<string, string> = {
      OPEN: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      PLANNED: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      IN_PROGRESS: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      ON_HOLD: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      DONE: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      CLOSED: 'bg-slate-600/10 text-slate-400 border-slate-600/20',
      CANCELLED: 'bg-red-900/10 text-red-400 border-red-900/20',
    };
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ' + (m[s] ?? '');
  }

  healthIcon(status: string) {
    if (status === 'GOOD') return 'pi-check-circle text-emerald-400';
    if (status === 'WARNING') return 'pi-exclamation-circle text-amber-400';
    return 'pi-times-circle text-rose-400';
  }

  healthBarClass(status: string) {
    if (status === 'GOOD') return 'bg-emerald-500';
    if (status === 'WARNING') return 'bg-amber-500';
    return 'bg-rose-500';
  }

  freqLabel(f: string) {
    const m: Record<string, string> = {
      WEEKLY: 'Semanal', MONTHLY: 'Mensual', QUARTERLY: 'Trimestral',
      SEMIANNUAL: 'Semestral', ANNUAL: 'Anual',
    };
    return m[f] ?? f;
  }

  isOverdue(iso: string) { return new Date(iso).getTime() < Date.now(); }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }
}
