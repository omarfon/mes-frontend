import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService, MaintenancePlan, PmFrequency } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-preventive',
  imports: [CommonModule, FormsModule],
  templateUrl: './preventive.html',
  styleUrl: './preventive.css',
})
export class PreventiveComponent {
  view: 'PLANS' | 'AGENDA' = 'PLANS';
  q = '';
  filterActive: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  selectedPlanId: string | null = null;
  showForm = false;
  editingId: string | null = null;

  planForm = {
    name: '',
    assetCode: '',
    frequency: 'MONTHLY' as PmFrequency,
    estimatedMinutes: 60,
    nextAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    active: true,
  };

  taskForm = { task: '', mandatory: true };

  constructor(public ms: MaintenanceStoreService) {}

  get assets() { return this.ms.assets; }
  get plans() { return this.ms.plans; }

  get filteredPlans() {
    const t = this.q.trim().toLowerCase();
    return this.ms.plans.filter(p => {
      if (this.filterActive === 'ACTIVE' && !p.active) return false;
      if (this.filterActive === 'INACTIVE' && p.active) return false;
      if (!t) return true;
      return [p.code, p.name, p.assetCode, p.assetName].join(' ').toLowerCase().includes(t);
    });
  }

  get selectedPlan(): MaintenancePlan | null {
    return this.ms.plans.find(p => p.id === this.selectedPlanId) ?? null;
  }

  get upcomingPlans() {
    const now = Date.now();
    return this.ms.plans
      .filter(p => p.active)
      .map(p => ({
        ...p,
        overdue: new Date(p.nextAt).getTime() < now,
        daysUntil: Math.ceil((new Date(p.nextAt).getTime() - now) / 86400000),
      }))
      .sort((a, b) => new Date(a.nextAt).getTime() - new Date(b.nextAt).getTime());
  }

  get kpis() {
    const now = Date.now();
    const active = this.ms.plans.filter(p => p.active).length;
    const overdue = this.ms.plans.filter(p => p.active && new Date(p.nextAt).getTime() < now).length;
    const upcoming7 = this.ms.plans.filter(p => p.active && new Date(p.nextAt).getTime() >= now && new Date(p.nextAt).getTime() < now + 7 * 86400000).length;
    return { total: this.ms.plans.length, active, overdue, upcoming7 };
  }

  selectPlan(p: MaintenancePlan) {
    this.selectedPlanId = p.id;
    this.showForm = false;
  }

  newPlan() {
    this.editingId = null;
    this.planForm = {
      name: '',
      assetCode: this.ms.assets[0]?.code ?? '',
      frequency: 'MONTHLY',
      estimatedMinutes: 60,
      nextAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      active: true,
    };
    this.showForm = true;
    this.selectedPlanId = null;
  }

  editPlan(p: MaintenancePlan) {
    this.editingId = p.id;
    this.planForm = {
      name: p.name,
      assetCode: p.assetCode,
      frequency: p.frequency,
      estimatedMinutes: p.estimatedMinutes,
      nextAt: p.nextAt.split('T')[0],
      active: p.active,
    };
    this.showForm = true;
    this.selectedPlanId = p.id;
  }

  submitPlan() {
    if (!this.planForm.name.trim() || !this.planForm.assetCode) return;
    const nextAtIso = new Date(this.planForm.nextAt + 'T08:00:00').toISOString();
    if (this.editingId) {
      const p = this.ms.plans.find(x => x.id === this.editingId);
      if (p) {
        const asset = this.ms.assets.find(a => a.code === this.planForm.assetCode);
        p.name = this.planForm.name;
        p.assetCode = this.planForm.assetCode;
        p.assetName = asset?.name ?? p.assetName;
        p.location = asset?.location ?? p.location;
        p.frequency = this.planForm.frequency;
        p.estimatedMinutes = this.planForm.estimatedMinutes;
        p.nextAt = nextAtIso;
        p.active = this.planForm.active;
        this.selectedPlanId = p.id;
      }
    } else {
      const plan = this.ms.addPlan({
        name: this.planForm.name,
        assetCode: this.planForm.assetCode,
        frequency: this.planForm.frequency,
        estimatedMinutes: this.planForm.estimatedMinutes,
        nextAt: nextAtIso,
        active: this.planForm.active,
      });
      this.selectedPlanId = plan.id;
    }
    this.showForm = false;
    this.editingId = null;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  removePlan(p: MaintenancePlan) {
    if (!confirm('¿Eliminar este plan?')) return;
    const idx = this.ms.plans.indexOf(p);
    if (idx >= 0) this.ms.plans.splice(idx, 1);
    if (this.selectedPlanId === p.id) { this.selectedPlanId = null; this.showForm = false; }
  }

  toggleActive(p: MaintenancePlan) { p.active = !p.active; }

  addTask() {
    if (!this.selectedPlan || !this.taskForm.task.trim()) return;
    this.selectedPlan.checklist.push({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      task: this.taskForm.task.trim(),
      mandatory: this.taskForm.mandatory,
    });
    this.taskForm = { task: '', mandatory: true };
  }

  removeTask(taskId: string) {
    if (!this.selectedPlan) return;
    this.selectedPlan.checklist = this.selectedPlan.checklist.filter(t => t.id !== taskId);
  }

  freqLabel(f: PmFrequency) {
    const m: Record<PmFrequency, string> = {
      WEEKLY: 'Semanal', MONTHLY: 'Mensual', QUARTERLY: 'Trimestral',
      SEMIANNUAL: 'Semestral', ANNUAL: 'Anual',
    };
    return m[f] ?? f;
  }

  freqBadge(f: PmFrequency) {
    const m: Record<string, string> = {
      WEEKLY: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      MONTHLY: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      QUARTERLY: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      SEMIANNUAL: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      ANNUAL: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    };
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ' + (m[f] ?? '');
  }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  isOverdue(iso: string) { return new Date(iso).getTime() < Date.now(); }

  daysUntil(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  }
}
