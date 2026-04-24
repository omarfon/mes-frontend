import { Injectable } from '@angular/core';
import { FormTemplate, FormTemplateCode, DynamicFormField } from '../../shared/models/form-template.model';

@Injectable({ providedIn: 'root' })
export class FormTemplateService {
  private readonly storageKey = 'mes.dynamic.form.templates.v1';
  private templates: FormTemplate[] = this.load();

  getAllTemplates(): FormTemplate[] {
    return this.templates.map(t => ({ ...t, fields: t.fields.map(f => ({ ...f, options: [...(f.options ?? [])] })) }));
  }

  getTemplateByCode(code: FormTemplateCode): FormTemplate | undefined {
    const template = this.templates.find(t => t.code === code);
    return template ? { ...template, fields: template.fields.map(f => ({ ...f, options: [...(f.options ?? [])] })) } : undefined;
  }

  saveTemplate(updated: FormTemplate): void {
    const idx = this.templates.findIndex(t => t.id === updated.id);
    if (idx === -1) return;
    this.templates[idx] = {
      ...updated,
      fields: updated.fields.map(f => ({ ...f, options: [...(f.options ?? [])] })),
    };
    this.persist();
  }

  addField(templateId: string, field: DynamicFormField): void {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    template.fields.push({ ...field, options: [...(field.options ?? [])] });
    this.persist();
  }

  updateField(templateId: string, fieldId: string, field: DynamicFormField): void {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    const idx = template.fields.findIndex(f => f.id === fieldId);
    if (idx === -1) return;
    template.fields[idx] = { ...field, options: [...(field.options ?? [])] };
    this.persist();
  }

  deleteField(templateId: string, fieldId: string): void {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    template.fields = template.fields.filter(f => f.id !== fieldId);
    this.persist();
  }

  evaluateVisibility(condition: string | undefined, values: Record<string, any>): boolean {
    if (!condition?.trim()) return true;
    try {
      // Dynamic rules are configured by admins and evaluated client-side for flexibility.
      const fn = new Function('values', `with(values){ return (${condition}); }`);
      return Boolean(fn(values));
    } catch {
      return true;
    }
  }

  evaluateCalculation(expression: string | undefined, values: Record<string, any>): any {
    if (!expression?.trim()) return undefined;
    try {
      const fn = new Function('values', `with(values){ return (${expression}); }`);
      return fn(values);
    } catch {
      return undefined;
    }
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.templates));
  }

  private load(): FormTemplate[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      const seed = this.defaultTemplates();
      localStorage.setItem(this.storageKey, JSON.stringify(seed));
      return seed;
    }
    try {
      const parsed = JSON.parse(raw) as FormTemplate[];
      if (!Array.isArray(parsed) || parsed.length === 0) return this.defaultTemplates();
      return parsed;
    } catch {
      return this.defaultTemplates();
    }
  }

  private defaultTemplates(): FormTemplate[] {
    return [
      {
        id: 'tpl-production-record',
        code: 'PRODUCTION_RECORD',
        name: 'Registro de produccion',
        description: 'Captura de produccion en planta',
        fields: [
          { id: 'f-shift', key: 'turno', label: 'Turno', uiType: 'select', dataType: 'text', required: true, options: ['T1', 'T2', 'T3'] },
          { id: 'f-operador', key: 'operador', label: 'Operador', uiType: 'input', dataType: 'text', required: true, placeholder: 'Nombre operador' },
          { id: 'f-temp', key: 'temperatura', label: 'Temperatura (C)', uiType: 'input', dataType: 'number', required: false, validations: { min: 0, max: 250 } },
          { id: 'f-hum', key: 'humedad', label: 'Humedad (%)', uiType: 'input', dataType: 'number', required: false, validations: { min: 0, max: 100 } },
          { id: 'f-qr', key: 'qrLote', label: 'QR/RFID lote', uiType: 'scanner', dataType: 'text', required: false },
          { id: 'f-gramaje', key: 'gramaje', label: 'Gramaje', uiType: 'input', dataType: 'number', required: false },
          { id: 'f-torque', key: 'torque', label: 'Torque', uiType: 'input', dataType: 'number', required: false },
          { id: 'f-net', key: 'pesoNeto', label: 'Peso neto', uiType: 'input', dataType: 'number', required: false, calculationExpression: 'cantidadPlanificada ? cantidadPlanificada * 0.95 : undefined' },
        ],
      },
      {
        id: 'tpl-inspection-record',
        code: 'INSPECTION_RECORD',
        name: 'Registro de inspeccion',
        description: 'Control de calidad por lote',
        fields: [
          { id: 'f-inspector', key: 'inspector', label: 'Inspector', uiType: 'input', dataType: 'text', required: true },
          { id: 'f-result', key: 'resultado', label: 'Resultado', uiType: 'select', dataType: 'text', required: true, options: ['APROBADO', 'RECHAZADO'] },
          { id: 'f-evidence', key: 'evidencia', label: 'Evidencia', uiType: 'file', dataType: 'text', required: false },
        ],
      },
      {
        id: 'tpl-downtime-record',
        code: 'DOWNTIME_RECORD',
        name: 'Registro de paro',
        description: 'Paros de maquina y causa raiz',
        fields: [
          { id: 'f-causa', key: 'causa', label: 'Causa', uiType: 'select', dataType: 'text', required: true, options: ['MECANICA', 'ELECTRICA', 'CALIDAD', 'LOGISTICA'] },
          { id: 'f-inicio', key: 'inicioParo', label: 'Inicio paro', uiType: 'input', dataType: 'datetime', required: true },
          { id: 'f-fin', key: 'finParo', label: 'Fin paro', uiType: 'input', dataType: 'datetime', required: true },
        ],
      },
      {
        id: 'tpl-consumption-record',
        code: 'CONSUMPTION_RECORD',
        name: 'Registro de consumo',
        description: 'Consumo de materiales por orden',
        fields: [
          { id: 'f-material', key: 'material', label: 'Material', uiType: 'input', dataType: 'text', required: true },
          { id: 'f-cantidad', key: 'cantidad', label: 'Cantidad consumida', uiType: 'input', dataType: 'number', required: true, validations: { min: 0 } },
          { id: 'f-unidad', key: 'uom', label: 'Unidad', uiType: 'input', dataType: 'text', required: true },
        ],
      },
      {
        id: 'tpl-wo-closure',
        code: 'WO_CLOSURE',
        name: 'Cierre de OT',
        description: 'Cierre tecnico de orden de trabajo',
        fields: [
          { id: 'f-cierre', key: 'cierreTecnico', label: 'Cierre tecnico', uiType: 'select', dataType: 'text', required: true, options: ['OK', 'PENDIENTE', 'REQUIERE_RETRABAJO'] },
          { id: 'f-horas', key: 'horasTecnicas', label: 'Horas tecnicas', uiType: 'input', dataType: 'number', required: true, validations: { min: 0 } },
          { id: 'f-evi', key: 'evidenciaCierre', label: 'Adjunto cierre', uiType: 'file', dataType: 'text', required: false },
        ],
      },
    ];
  }
}
