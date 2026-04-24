import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormTemplateService } from '../../../core/services/form-template.service';
import { DynamicFieldDataType, DynamicFieldUiType, DynamicFormField, FormTemplate } from '../../../shared/models/form-template.model';

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

type KpiCode = 'OEE' | 'MTBF' | 'MTTR' | 'RENDIMIENTO' | 'SCRAP_RATE';

interface KpiDefinition {
  id: number;
  code: KpiCode;
  name: string;
  formula: string;
  unit: '%' | 'h' | 'min';
  target: number;
  tolerance: number;
  active: boolean;
}

interface AlertThreshold {
  id: number;
  type: 'PARO' | 'DESVIACION' | 'DEFECTOS' | 'CONSUMO';
  metric: string;
  warningFrom: number;
  criticalFrom: number;
  unit: string;
  active: boolean;
}

type NotificationChannel = 'PANTALLA' | 'EMAIL' | 'WHATSAPP';

interface AlertRouting {
  id: number;
  alertType: AlertThreshold['type'];
  channels: NotificationChannel[];
  recipients: string[];
  active: boolean;
}

@Component({
  selector: 'app-system-params',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-params.html',
})
export class SystemParamsComponent {
  activeTab: 'SHIFTS' | 'STATUSES' | 'WORKFLOWS' | 'KPI_ALERTS' | 'FORM_TEMPLATES' = 'KPI_ALERTS';

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

  // KPI y alertas
  kpis: KpiDefinition[] = [
    {
      id: 1,
      code: 'OEE',
      name: 'Overall Equipment Effectiveness',
      formula: 'Disponibilidad x Rendimiento x Calidad',
      unit: '%',
      target: 85,
      tolerance: 5,
      active: true,
    },
    {
      id: 2,
      code: 'MTBF',
      name: 'Mean Time Between Failures',
      formula: 'Tiempo operativo total / Numero de fallas',
      unit: 'h',
      target: 120,
      tolerance: 15,
      active: true,
    },
    {
      id: 3,
      code: 'MTTR',
      name: 'Mean Time To Repair',
      formula: 'Tiempo total de reparacion / Numero de reparaciones',
      unit: 'min',
      target: 45,
      tolerance: 10,
      active: true,
    },
    {
      id: 4,
      code: 'RENDIMIENTO',
      name: 'Rendimiento',
      formula: '(Produccion real / Produccion teorica) x 100',
      unit: '%',
      target: 95,
      tolerance: 3,
      active: true,
    },
    {
      id: 5,
      code: 'SCRAP_RATE',
      name: 'Scrap Rate',
      formula: '(Unidades scrap / Unidades producidas) x 100',
      unit: '%',
      target: 2,
      tolerance: 0.5,
      active: true,
    },
  ];
  editingKpi: KpiDefinition | null = null;
  kpiForm: Partial<KpiDefinition> = {};

  alertThresholds: AlertThreshold[] = [
    { id: 1, type: 'PARO', metric: 'Duracion de paro', warningFrom: 10, criticalFrom: 30, unit: 'min', active: true },
    { id: 2, type: 'DESVIACION', metric: 'Desviacion de plan', warningFrom: 5, criticalFrom: 10, unit: '%', active: true },
    { id: 3, type: 'DEFECTOS', metric: 'Defectos por lote', warningFrom: 3, criticalFrom: 8, unit: 'uds', active: true },
    { id: 4, type: 'CONSUMO', metric: 'Sobreconsumo material', warningFrom: 7, criticalFrom: 12, unit: '%', active: true },
  ];
  editingThreshold: AlertThreshold | null = null;
  thresholdForm: Partial<AlertThreshold> = {};

  alertRoutings: AlertRouting[] = [
    { id: 1, alertType: 'PARO', channels: ['PANTALLA', 'EMAIL', 'WHATSAPP'], recipients: ['Supervisor Mantenimiento', 'Jefe Planta'], active: true },
    { id: 2, alertType: 'DESVIACION', channels: ['PANTALLA', 'EMAIL'], recipients: ['Supervisor Produccion'], active: true },
    { id: 3, alertType: 'DEFECTOS', channels: ['PANTALLA', 'EMAIL', 'WHATSAPP'], recipients: ['Inspector Calidad', 'Jefe Calidad'], active: true },
    { id: 4, alertType: 'CONSUMO', channels: ['PANTALLA', 'EMAIL'], recipients: ['Analista Inventario', 'Supervisor Produccion'], active: true },
  ];
  editingRouting: AlertRouting | null = null;
  routingForm: Partial<AlertRouting> = {};

  readonly kpiCodes: KpiCode[] = ['OEE', 'MTBF', 'MTTR', 'RENDIMIENTO', 'SCRAP_RATE'];
  readonly alertTypes: AlertThreshold['type'][] = ['PARO', 'DESVIACION', 'DEFECTOS', 'CONSUMO'];
  readonly channelOptions: NotificationChannel[] = ['PANTALLA', 'EMAIL', 'WHATSAPP'];
  readonly recipientOptions: string[] = [
    'Supervisor Produccion',
    'Supervisor Mantenimiento',
    'Inspector Calidad',
    'Analista Inventario',
    'Jefe Planta',
    'Jefe Calidad',
    'Gerencia Operaciones',
  ];

  formTemplates: FormTemplate[] = [];
  selectedTemplateId: string | null = null;
  editingTemplateFieldId: string | null = null;

  readonly dynamicUiTypes: DynamicFieldUiType[] = ['input', 'select', 'file', 'scanner'];
  readonly dynamicDataTypes: DynamicFieldDataType[] = ['text', 'number', 'date', 'datetime', 'boolean'];

  templateFieldForm: Partial<DynamicFormField> & { optionsText?: string } = {
    uiType: 'input',
    dataType: 'text',
    required: false,
    validations: {},
    optionsText: '',
  };

  constructor(private route: ActivatedRoute, private formTemplateService: FormTemplateService) {
    this.reloadTemplates();

    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'kpi-alerts') this.activeTab = 'KPI_ALERTS';
    if (tab === 'form-templates') this.activeTab = 'FORM_TEMPLATES';
  }

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

  // KPI methods
  newKpi() {
    this.editingKpi = {
      id: 0,
      code: 'OEE',
      name: '',
      formula: '',
      unit: '%',
      target: 0,
      tolerance: 0,
      active: true,
    };
    this.kpiForm = { ...this.editingKpi };
  }

  editKpi(kpi: KpiDefinition) {
    this.editingKpi = kpi;
    this.kpiForm = { ...kpi };
  }

  saveKpi() {
    if (!this.kpiForm.code || !this.kpiForm.name || !this.kpiForm.formula || this.kpiForm.target == null || this.kpiForm.tolerance == null) return;

    if (this.editingKpi?.id === 0) {
      const newId = Math.max(...this.kpis.map(k => k.id), 0) + 1;
      this.kpis.push({ ...this.kpiForm as KpiDefinition, id: newId });
    } else {
      const idx = this.kpis.findIndex(k => k.id === this.editingKpi?.id);
      if (idx !== -1) this.kpis[idx] = { ...this.kpiForm as KpiDefinition };
    }
    this.cancelKpi();
  }

  cancelKpi() {
    this.editingKpi = null;
    this.kpiForm = {};
  }

  deleteKpi(id: number) {
    this.kpis = this.kpis.filter(k => k.id !== id);
  }

  // Threshold methods
  newThreshold() {
    this.editingThreshold = {
      id: 0,
      type: 'PARO',
      metric: '',
      warningFrom: 0,
      criticalFrom: 0,
      unit: '%',
      active: true,
    };
    this.thresholdForm = { ...this.editingThreshold };
  }

  editThreshold(threshold: AlertThreshold) {
    this.editingThreshold = threshold;
    this.thresholdForm = { ...threshold };
  }

  saveThreshold() {
    if (!this.thresholdForm.type || !this.thresholdForm.metric || this.thresholdForm.warningFrom == null || this.thresholdForm.criticalFrom == null || !this.thresholdForm.unit) return;

    if (this.thresholdForm.warningFrom > this.thresholdForm.criticalFrom) return;

    if (this.editingThreshold?.id === 0) {
      const newId = Math.max(...this.alertThresholds.map(t => t.id), 0) + 1;
      this.alertThresholds.push({ ...this.thresholdForm as AlertThreshold, id: newId });
    } else {
      const idx = this.alertThresholds.findIndex(t => t.id === this.editingThreshold?.id);
      if (idx !== -1) this.alertThresholds[idx] = { ...this.thresholdForm as AlertThreshold };
    }
    this.cancelThreshold();
  }

  cancelThreshold() {
    this.editingThreshold = null;
    this.thresholdForm = {};
  }

  deleteThreshold(id: number) {
    this.alertThresholds = this.alertThresholds.filter(t => t.id !== id);
  }

  // Routing methods
  newRouting() {
    this.editingRouting = {
      id: 0,
      alertType: 'PARO',
      channels: ['PANTALLA'],
      recipients: [],
      active: true,
    };
    this.routingForm = { ...this.editingRouting, channels: [...this.editingRouting.channels], recipients: [] };
  }

  editRouting(routing: AlertRouting) {
    this.editingRouting = routing;
    this.routingForm = {
      ...routing,
      channels: [...routing.channels],
      recipients: [...routing.recipients],
    };
  }

  saveRouting() {
    if (!this.routingForm.alertType || !this.routingForm.channels?.length || !this.routingForm.recipients?.length) return;

    if (this.editingRouting?.id === 0) {
      const newId = Math.max(...this.alertRoutings.map(r => r.id), 0) + 1;
      this.alertRoutings.push({ ...this.routingForm as AlertRouting, id: newId });
    } else {
      const idx = this.alertRoutings.findIndex(r => r.id === this.editingRouting?.id);
      if (idx !== -1) this.alertRoutings[idx] = { ...this.routingForm as AlertRouting };
    }
    this.cancelRouting();
  }

  cancelRouting() {
    this.editingRouting = null;
    this.routingForm = {};
  }

  deleteRouting(id: number) {
    this.alertRoutings = this.alertRoutings.filter(r => r.id !== id);
  }

  toggleChannel(channel: NotificationChannel, checked: boolean) {
    const current = new Set(this.routingForm.channels ?? []);
    if (checked) {
      current.add(channel);
    } else {
      current.delete(channel);
    }
    this.routingForm.channels = Array.from(current);
  }

  toggleRecipient(recipient: string, checked: boolean) {
    const current = new Set(this.routingForm.recipients ?? []);
    if (checked) {
      current.add(recipient);
    } else {
      current.delete(recipient);
    }
    this.routingForm.recipients = Array.from(current);
  }

  get selectedTemplate(): FormTemplate | null {
    return this.formTemplates.find(t => t.id === this.selectedTemplateId) ?? null;
  }

  reloadTemplates() {
    this.formTemplates = this.formTemplateService.getAllTemplates();
    if (!this.selectedTemplateId && this.formTemplates.length) {
      this.selectedTemplateId = this.formTemplates[0].id;
    }
  }

  selectTemplate(templateId: string) {
    this.selectedTemplateId = templateId;
    this.cancelTemplateFieldEdit();
  }

  newTemplateField() {
    this.editingTemplateFieldId = null;
    this.templateFieldForm = {
      id: '',
      key: '',
      label: '',
      uiType: 'input',
      dataType: 'text',
      required: false,
      validations: {},
      placeholder: '',
      optionsText: '',
      visibilityCondition: '',
      calculationExpression: '',
    };
  }

  editTemplateField(field: DynamicFormField) {
    this.editingTemplateFieldId = field.id;
    this.templateFieldForm = {
      ...field,
      validations: { ...(field.validations ?? {}) },
      optionsText: (field.options ?? []).join(', '),
    };
  }

  saveTemplateField() {
    if (!this.selectedTemplate) return;
    if (!this.templateFieldForm.key || !this.templateFieldForm.label || !this.templateFieldForm.uiType || !this.templateFieldForm.dataType) return;

    const field: DynamicFormField = {
      id: this.editingTemplateFieldId || `f-${Date.now()}`,
      key: this.templateFieldForm.key.trim(),
      label: this.templateFieldForm.label.trim(),
      uiType: this.templateFieldForm.uiType,
      dataType: this.templateFieldForm.dataType,
      required: Boolean(this.templateFieldForm.required),
      placeholder: this.templateFieldForm.placeholder?.trim() || undefined,
      options: (this.templateFieldForm.optionsText || '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean),
      validations: {
        min: this.templateFieldForm.validations?.min,
        max: this.templateFieldForm.validations?.max,
        pattern: this.templateFieldForm.validations?.pattern || undefined,
      },
      visibilityCondition: this.templateFieldForm.visibilityCondition?.trim() || undefined,
      calculationExpression: this.templateFieldForm.calculationExpression?.trim() || undefined,
    };

    if (this.editingTemplateFieldId) {
      this.formTemplateService.updateField(this.selectedTemplate.id, this.editingTemplateFieldId, field);
    } else {
      this.formTemplateService.addField(this.selectedTemplate.id, field);
    }

    this.reloadTemplates();
    this.cancelTemplateFieldEdit();
  }

  cancelTemplateFieldEdit() {
    this.editingTemplateFieldId = null;
    this.templateFieldForm = {
      uiType: 'input',
      dataType: 'text',
      required: false,
      validations: {},
      optionsText: '',
    };
  }

  deleteTemplateField(fieldId: string) {
    if (!this.selectedTemplate) return;
    this.formTemplateService.deleteField(this.selectedTemplate.id, fieldId);
    this.reloadTemplates();
  }
}
