import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivityLogHttpService,
  ActivityLogEntry,
  ActivityDashboard,
  UserActivitySummary,
} from '../../../core/services/activity-log-http.service';

type Tab = 'recent' | 'by-user' | 'dashboard';

@Component({
  selector: 'app-activity-log-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-log.html',
})
export class ActivityLogViewComponent implements OnInit {
  activeTab: Tab = 'dashboard';

  // Dashboard
  dashboard: ActivityDashboard | null = null;

  // Recent
  recentEntries: ActivityLogEntry[] = [];
  filterUserEmail = '';
  filterLimit = 50;
  loadingRecent = false;

  // By user
  userSummaries: UserActivitySummary[] = [];
  filterDays = 30;
  loadingUsers = false;

  // Estado
  loading = false;
  error: string | null = null;

  // Modal de detalle
  selectedEntry: ActivityLogEntry | null = null;

  openDetail(entry: ActivityLogEntry) { this.selectedEntry = entry; }
  closeDetail() { this.selectedEntry = null; }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeDetail(); }

  jsonKeys(obj: Record<string, any> | null): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatJson(val: any): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  }

  constructor(private svc: ActivityLogHttpService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    if (tab === 'dashboard' && !this.dashboard) this.loadDashboard();
    if (tab === 'recent') this.loadRecent();
    if (tab === 'by-user') this.loadByUser();
  }

  loadDashboard() {
    this.loading = true;
    this.error = null;
    this.svc.getDashboard().subscribe({
      next: (d) => { this.dashboard = d; this.loading = false; },
      error: (e) => { this.error = 'Error al cargar el dashboard: ' + e.message; this.loading = false; },
    });
  }

  loadRecent() {
    this.loadingRecent = true;
    this.svc
      .getRecent(this.filterLimit, this.filterUserEmail || undefined)
      .subscribe({
        next: (d) => { this.recentEntries = d; this.loadingRecent = false; },
        error: () => { this.loadingRecent = false; },
      });
  }

  loadByUser() {
    this.loadingUsers = true;
    this.svc.getByUser(this.filterDays).subscribe({
      next: (d) => { this.userSummaries = d; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; },
    });
  }

  actionBadge(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-700',
      STATUS_CHANGE: 'bg-yellow-100 text-yellow-800',
      EXPORT: 'bg-indigo-100 text-indigo-800',
    };
    return map[action] ?? 'bg-gray-100 text-gray-700';
  }

  actionLabel(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'Crear',
      UPDATE: 'Editar',
      DELETE: 'Eliminar',
      LOGIN: 'Login',
      LOGOUT: 'Logout',
      STATUS_CHANGE: 'Cambio estado',
      EXPORT: 'Exportar',
    };
    return map[action] ?? action;
  }

  trackById(_: number, e: ActivityLogEntry) { return e.id; }
  trackByEmail(_: number, e: UserActivitySummary) { return e.userEmail; }
}
