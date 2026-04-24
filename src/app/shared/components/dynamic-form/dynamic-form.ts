import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFormField, FormTemplate } from '../../models/form-template.model';
import { FormTemplateService } from '../../../core/services/form-template.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-form.html',
})
export class DynamicFormComponent implements OnChanges {
  @Input() template: FormTemplate | null = null;
  @Input() initialValue: Record<string, any> = {};
  @Input() compact = false;

  @Output() valueChange = new EventEmitter<Record<string, any>>();
  @Output() validityChange = new EventEmitter<boolean>();

  values: Record<string, any> = {};

  constructor(private templateService: FormTemplateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['template'] || changes['initialValue']) {
      this.values = { ...this.initialValue };
      this.applyCalculations();
      this.emitState();
    }
  }

  visibleFields(): DynamicFormField[] {
    if (!this.template) return [];
    return this.template.fields.filter(field => this.templateService.evaluateVisibility(field.visibilityCondition, this.values));
  }

  inputType(field: DynamicFormField): string {
    if (field.dataType === 'number') return 'number';
    if (field.dataType === 'date') return 'date';
    if (field.dataType === 'datetime') return 'datetime-local';
    return 'text';
  }

  onFieldChange(field: DynamicFormField, value: any): void {
    this.values[field.key] = value;
    this.applyCalculations();
    this.emitState();
  }

  onFileChange(field: DynamicFormField, event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    this.values[field.key] = files && files.length ? files[0].name : '';
    this.emitState();
  }

  simulateScanner(field: DynamicFormField): void {
    const timestamp = new Date().getTime();
    this.values[field.key] = `SCAN-${timestamp}`;
    this.emitState();
  }

  isFieldInvalid(field: DynamicFormField): boolean {
    const value = this.values[field.key];

    if (field.required && (value === null || value === undefined || value === '')) return true;

    if (field.dataType === 'number' && value !== null && value !== undefined && value !== '') {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) return true;
      if (field.validations?.min != null && numeric < field.validations.min) return true;
      if (field.validations?.max != null && numeric > field.validations.max) return true;
    }

    if (field.validations?.pattern && value) {
      try {
        const regex = new RegExp(field.validations.pattern);
        if (!regex.test(String(value))) return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  private applyCalculations(): void {
    if (!this.template) return;

    for (const field of this.template.fields) {
      const calcValue = this.templateService.evaluateCalculation(field.calculationExpression, this.values);
      if (calcValue !== undefined) {
        this.values[field.key] = calcValue;
      }
    }
  }

  private emitState(): void {
    const fields = this.visibleFields();
    const valid = fields.every(f => !this.isFieldInvalid(f));
    this.valueChange.emit({ ...this.values });
    this.validityChange.emit(valid);
  }
}
