import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'HOURS' | 'CYCLES';
type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
type TaskStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'OVERDUE';

interface PreventiveTask {
  id: string;
  description: string;
  estimatedMinutes: number;
  mandatory: boolean;
}

interface PreventivePlan {
  id: string;
  code: string;
  name: string;
  assetCode: string;
  assetName: string;
  frequency: Frequency;
  intervalValue: number; // cada X días/semanas/meses/horas/ciclos
  status: PlanStatus;
  tasks: PreventiveTask[];
  lastExecuted?: string;
  nextDue: string;
  createdAt: string;
}

interface ScheduledMaintenance {
  id: string;
  planId: string;
  planCode: string;
  planName: string;
  assetCode: string;
  assetName: string;
  scheduledDate: string;
  status: TaskStatus;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'app-preventive',
  imports: [CommonModule, FormsModule],
  templateUrl: './preventive.html',
  styleUrl: './preventive.css',
})
export class PreventiveComponent {
  view: 'PLANS' | 'SCHEDULE' = 'PLANS';
  q = '';
  filterStatus: 'ALL' | PlanStatus = 'ALL';
  selectedPlan: PreventivePlan | null = null;
  selectedSchedule: ScheduledMaintenance | null = null;
  editingPlanId: string | null = null;

  // Form for creating/editing plans
  planForm = {
    code: '',
    name: '',
    assetCode: 'MAQ-001',
    frequency: 'MONTHLY' as Frequency,
    intervalValue: 1,
    status: 'ACTIVE' as PlanStatus
  };

  // Task form
  taskForm = {
    description: '',
    estimatedMinutes: 30,
    mandatory: true
  };

  // Complete schedule form
  completeForm = {
    completedBy: 'técnico',
    notes: ''
  };

  // Mock data
  assets = [
    { code: 'MAQ-001', name: 'Hiladora 01' },
    { code: 'MAQ-002', name: 'Carda 02' },
    { code: 'MAQ-003', name: 'Telar 05' },
    { code: 'COMP-A1', name: 'Compresor A1' }
  ];

  plans: PreventivePlan[] = [
    {
      id: '1',
      code: 'PM-001',
      name: 'Mantenimiento Mensual Hiladora',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      frequency: 'MONTHLY',
      intervalValue: 1,
      status: 'ACTIVE',
      lastExecuted: '2025-11-27',
      nextDue: '2025-12-27',
      createdAt: '2025-01-01',
      tasks: [
        { id: 't1', description: 'Inspección visual general', estimatedMinutes: 15, mandatory: true },
        { id: 't2', description: 'Lubricación de rodamientos', estimatedMinutes: 30, mandatory: true },
        { id: 't3', description: 'Verificar tensión de correas', estimatedMinutes: 20, mandatory: true },
        { id: 't4', description: 'Limpieza de filtros', estimatedMinutes: 25, mandatory: false }
      ]
    },
    {
      id: '2',
      code: 'PM-002',
      name: 'Mantenimiento Trimestral Compresor',
      assetCode: 'COMP-A1',
      assetName: 'Compresor A1',
      frequency: 'QUARTERLY',
      intervalValue: 1,
      status: 'ACTIVE',
      lastExecuted: '2025-09-20',
      nextDue: '2025-12-20',
      createdAt: '2025-01-01',
      tasks: [
        { id: 't5', description: 'Cambio de aceite', estimatedMinutes: 45, mandatory: true },
        { id: 't6', description: 'Inspeccionar válvulas', estimatedMinutes: 30, mandatory: true },
        { id: 't7', description: 'Verificar presiones', estimatedMinutes: 20, mandatory: true }
      ]
    }
  ];

  scheduledMaintenance: ScheduledMaintenance[] = [
    {
      id: 's1',
      planId: '1',
      planCode: 'PM-001',
      planName: 'Mantenimiento Mensual Hiladora',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      scheduledDate: '2025-12-27',
      status: 'PENDING'
    },
    {
      id: 's2',
      planId: '2',
      planCode: 'PM-002',
      planName: 'Mantenimiento Trimestral Compresor',
      assetCode: 'COMP-A1',
      assetName: 'Compresor A1',
      scheduledDate: '2025-12-20',
      status: 'OVERDUE'
    },
    {
      id: 's3',
      planId: '1',
      planCode: 'PM-001',
      planName: 'Mantenimiento Mensual Hiladora',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      scheduledDate: '2025-11-27',
      status: 'COMPLETED',
      completedBy: 'Juan Pérez',
      completedAt: '2025-11-27T14:30:00',
      notes: 'Todo en orden'
    }
  ];

  get filteredPlans() {
    const t = this.q.trim().toLowerCase();
    return this.plans.filter(p => {
      if (this.filterStatus !== 'ALL' && p.status !== this.filterStatus) return false;
      if (!t) return true;
      const searchStr = [p.code, p.name, p.assetCode, p.assetName].join(' ').toLowerCase();
      return searchStr.includes(t);
    });
  }

  get filteredSchedule() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.scheduledMaintenance;
    return this.scheduledMaintenance.filter(s => {
      const searchStr = [s.planCode, s.planName, s.assetCode, s.assetName].join(' ').toLowerCase();
      return searchStr.includes(t);
    });
  }

  get upcomingSchedule() {
    return this.scheduledMaintenance
      .filter(s => s.status === 'PENDING' || s.status === 'OVERDUE')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
  }

  selectPlan(plan: PreventivePlan) {
    this.selectedPlan = plan;
    this.editingPlanId = null;
  }

  editPlan(plan: PreventivePlan) {
    this.editingPlanId = plan.id;
    this.planForm = {
      code: plan.code,
      name: plan.name,
      assetCode: plan.assetCode,
      frequency: plan.frequency,
      intervalValue: plan.intervalValue,
      status: plan.status
    };
    this.selectedPlan = plan;
  }

  submitPlan() {
    if (!this.planForm.code || !this.planForm.name) return;

    const asset = this.assets.find(a => a.code === this.planForm.assetCode);
    if (!asset) return;

    if (this.editingPlanId) {
      const idx = this.plans.findIndex(p => p.id === this.editingPlanId);
      if (idx >= 0) {
        this.plans[idx] = {
          ...this.plans[idx],
          code: this.planForm.code,
          name: this.planForm.name,
          assetCode: asset.code,
          assetName: asset.name,
          frequency: this.planForm.frequency,
          intervalValue: this.planForm.intervalValue,
          status: this.planForm.status
        };
      }
      this.cancelEditPlan();
      return;
    }

    const newPlan: PreventivePlan = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      code: this.planForm.code,
      name: this.planForm.name,
      assetCode: asset.code,
      assetName: asset.name,
      frequency: this.planForm.frequency,
      intervalValue: this.planForm.intervalValue,
      status: this.planForm.status,
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      tasks: []
    };

    this.plans.unshift(newPlan);
    this.resetPlanForm();
    this.selectPlan(newPlan);
  }

  removePlan(id: string) {
    if (!confirm('¿Eliminar este plan?')) return;
    this.plans = this.plans.filter(p => p.id !== id);
    if (this.selectedPlan?.id === id) this.selectedPlan = null;
  }

  cancelEditPlan() {
    this.editingPlanId = null;
    this.resetPlanForm();
  }

  resetPlanForm() {
    this.planForm = {
      code: '',
      name: '',
      assetCode: 'MAQ-001',
      frequency: 'MONTHLY',
      intervalValue: 1,
      status: 'ACTIVE'
    };
  }

  addTask() {
    if (!this.selectedPlan || !this.taskForm.description.trim()) return;

    const newTask: PreventiveTask = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      description: this.taskForm.description.trim(),
      estimatedMinutes: this.taskForm.estimatedMinutes,
      mandatory: this.taskForm.mandatory
    };

    this.selectedPlan.tasks.push(newTask);
    this.resetTaskForm();
  }

  removeTask(taskId: string) {
    if (!this.selectedPlan) return;
    this.selectedPlan.tasks = this.selectedPlan.tasks.filter(t => t.id !== taskId);
  }

  resetTaskForm() {
    this.taskForm = {
      description: '',
      estimatedMinutes: 30,
      mandatory: true
    };
  }

  selectSchedule(schedule: ScheduledMaintenance) {
    this.selectedSchedule = schedule;
    this.completeForm.completedBy = 'técnico';
    this.completeForm.notes = '';
  }

  completeSchedule() {
    if (!this.selectedSchedule) return;

    this.selectedSchedule.status = 'COMPLETED';
    this.selectedSchedule.completedBy = this.completeForm.completedBy;
    this.selectedSchedule.completedAt = new Date().toISOString();
    this.selectedSchedule.notes = this.completeForm.notes;

    this.selectedSchedule = null;
  }

  skipSchedule() {
    if (!this.selectedSchedule) return;
    this.selectedSchedule.status = 'SKIPPED';
    this.selectedSchedule = null;
  }

  getStatusBadge(status: PlanStatus | TaskStatus): string {
    const badges: Record<string, string> = {
      'ACTIVE': 'ui-badge-ok',
      'INACTIVE': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200',
      'DRAFT': 'ui-badge bg-blue-500/15 border-blue-500/25 text-blue-200',
      'PENDING': 'ui-badge-warn',
      'COMPLETED': 'ui-badge-ok',
      'SKIPPED': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200',
      'OVERDUE': 'ui-badge-bad'
    };
    return badges[status] || 'ui-badge';
  }

  getFrequencyLabel(frequency: Frequency, value: number): string {
    const labels: Record<Frequency, string> = {
      'DAILY': 'Diario',
      'WEEKLY': `Cada ${value} semana(s)`,
      'MONTHLY': `Cada ${value} mes(es)`,
      'QUARTERLY': 'Trimestral',
      'YEARLY': 'Anual',
      'HOURS': `Cada ${value} horas`,
      'CYCLES': `Cada ${value} ciclos`
    };
    return labels[frequency] || frequency;
  }

  getTotalEstimatedTime(tasks: PreventiveTask[]): number {
    return tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  }

  isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }
}
