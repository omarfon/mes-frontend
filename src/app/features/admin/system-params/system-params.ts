import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Shift {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface Status {
  id: number;
  module: string;
  statusKey: string;
  displayName: string;
  color: string;
  sortOrder: number;
}

interface WorkflowState {
  id: number;
  module: string;
  stateName: string;
  transitions: string[];
  requiredFields?: string[];
}

@Component({
  selector: 'app-system-params',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-params.html',
})
export class SystemParamsComponent {
  activeTab: 'SHIFTS' | 'STATUSES' | 'WORKFLOWS' = 'SHIFTS';

  // Shifts
  shifts: Shift[] = [
    { id: 1, name: 'Turno Mañana', code: 'T1', startTime: '07:00', endTime: '15:00', active: true },
    { id: 2, name: 'Turno Tarde', code: 'T2', startTime: '15:00', endTime: '23:00', active: true },
    { id: 3, name: 'Turno Noche', code: 'T3', startTime: '23:00', endTime: '07:00', active: true },
  ];
  editingShift: Shift | null = null;
  shiftForm: Partial<Shift> = {};

  // Statuses
  statuses: Status[] = [
    { id: 1, module: 'Producción', statusKey: 'PLANIFICADA', displayName: 'Planificada', color: 'gray', sortOrder: 1 },
    { id: 2, module: 'Producción', statusKey: 'EN_EJECUCION', displayName: 'En Ejecución', color: 'blue', sortOrder: 2 },
    { id: 3, module: 'Producción', statusKey: 'PAUSADA', displayName: 'Pausada', color: 'yellow', sortOrder: 3 },
    { id: 4, module: 'Producción', statusKey: 'COMPLETADA', displayName: 'Completada', color: 'green', sortOrder: 4 },
    { id: 5, module: 'Calidad', statusKey: 'PENDIENTE', displayName: 'Pendiente Inspección', color: 'gray', sortOrder: 1 },
    { id: 6, module: 'Calidad', statusKey: 'APROBADO', displayName: 'Aprobado', color: 'green', sortOrder: 2 },
    { id: 7, module: 'Calidad', statusKey: 'RECHAZADO', displayName: 'Rechazado', color: 'red', sortOrder: 3 },
  ];
  editingStatus: Status | null = null;
  statusForm: Partial<Status> = { sortOrder: 1 };
  filterStatusModule: string = 'ALL';

  // Workflows
  workflows: WorkflowState[] = [
    { id: 1, module: 'Producción', stateName: 'PLANIFICADA', transitions: ['EN_EJECUCION'] },
    { id: 2, module: 'Producción', stateName: 'EN_EJECUCION', transitions: ['PAUSADA', 'COMPLETADA'], requiredFields: ['operator', 'machine'] },
    { id: 3, module: 'Producción', stateName: 'PAUSADA', transitions: ['EN_EJECUCION', 'CANCELADA'], requiredFields: ['reason'] },
    { id: 4, module: 'Producción', stateName: 'COMPLETADA', transitions: [] },
  ];
  editingWorkflow: WorkflowState | null = null;
  workflowForm: Partial<WorkflowState> = { transitions: [] };
  filterWorkflowModule: string = 'ALL';

  modules = ['Producción', 'Calidad', 'Mantenimiento', 'Inventarios', 'Trazabilidad'];
  colors = ['gray', 'blue', 'green', 'yellow', 'red', 'purple', 'pink'];

  // Shifts methods
  get filteredShifts() {
    return this.shifts;
  }

  newShift() {
    this.editingShift = { id: 0, name: '', code: '', startTime: '', endTime: '', active: true };
    this.shiftForm = { ...this.editingShift };
  }

  editShift(shift: Shift) {
    this.editingShift = shift;
    this.shiftForm = { ...shift };
  }

  saveShift() {
    if (!this.shiftForm.name || !this.shiftForm.code || !this.shiftForm.startTime || !this.shiftForm.endTime) return;
    
    if (this.editingShift?.id === 0) {
      const newId = Math.max(...this.shifts.map(s => s.id), 0) + 1;
      this.shifts.push({ ...this.shiftForm as Shift, id: newId });
    } else {
      const idx = this.shifts.findIndex(s => s.id === this.editingShift?.id);
      if (idx !== -1) this.shifts[idx] = { ...this.shiftForm as Shift };
    }
    this.cancelShift();
  }

  cancelShift() {
    this.editingShift = null;
    this.shiftForm = {};
  }

  deleteShift(id: number) {
    this.shifts = this.shifts.filter(s => s.id !== id);
  }

  // Statuses methods
  get filteredStatuses() {
    if (this.filterStatusModule === 'ALL') return this.statuses;
    return this.statuses.filter(s => s.module === this.filterStatusModule);
  }

  newStatus() {
    this.editingStatus = { id: 0, module: 'Producción', statusKey: '', displayName: '', color: 'gray', sortOrder: 1 };
    this.statusForm = { ...this.editingStatus };
  }

  editStatus(status: Status) {
    this.editingStatus = status;
    this.statusForm = { ...status };
  }

  saveStatus() {
    if (!this.statusForm.module || !this.statusForm.statusKey || !this.statusForm.displayName) return;
    
    if (this.editingStatus?.id === 0) {
      const newId = Math.max(...this.statuses.map(s => s.id), 0) + 1;
      this.statuses.push({ ...this.statusForm as Status, id: newId });
    } else {
      const idx = this.statuses.findIndex(s => s.id === this.editingStatus?.id);
      if (idx !== -1) this.statuses[idx] = { ...this.statusForm as Status };
    }
    this.cancelStatus();
  }

  cancelStatus() {
    this.editingStatus = null;
    this.statusForm = { sortOrder: 1 };
  }

  deleteStatus(id: number) {
    this.statuses = this.statuses.filter(s => s.id !== id);
  }

  // Workflows methods
  get filteredWorkflows() {
    if (this.filterWorkflowModule === 'ALL') return this.workflows;
    return this.workflows.filter(w => w.module === this.filterWorkflowModule);
  }

  newWorkflow() {
    this.editingWorkflow = { id: 0, module: 'Producción', stateName: '', transitions: [] };
    this.workflowForm = { ...this.editingWorkflow };
  }

  editWorkflow(workflow: WorkflowState) {
    this.editingWorkflow = workflow;
    this.workflowForm = { ...workflow, transitions: [...workflow.transitions] };
  }

  saveWorkflow() {
    if (!this.workflowForm.module || !this.workflowForm.stateName || !this.workflowForm.transitions) return;
    
    if (this.editingWorkflow?.id === 0) {
      const newId = Math.max(...this.workflows.map(w => w.id), 0) + 1;
      this.workflows.push({ ...this.workflowForm as WorkflowState, id: newId });
    } else {
      const idx = this.workflows.findIndex(w => w.id === this.editingWorkflow?.id);
      if (idx !== -1) this.workflows[idx] = { ...this.workflowForm as WorkflowState };
    }
    this.cancelWorkflow();
  }

  cancelWorkflow() {
    this.editingWorkflow = null;
    this.workflowForm = { transitions: [] };
  }

  deleteWorkflow(id: number) {
    this.workflows = this.workflows.filter(w => w.id !== id);
  }
}
