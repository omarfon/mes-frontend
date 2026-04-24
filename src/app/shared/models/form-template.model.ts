export type DynamicFieldUiType = 'input' | 'select' | 'file' | 'scanner';
export type DynamicFieldDataType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';

export interface DynamicFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
}

export interface DynamicFormField {
  id: string;
  key: string;
  label: string;
  uiType: DynamicFieldUiType;
  dataType: DynamicFieldDataType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validations?: DynamicFieldValidation;
  visibilityCondition?: string;
  calculationExpression?: string;
}

export type FormTemplateCode =
  | 'PRODUCTION_RECORD'
  | 'INSPECTION_RECORD'
  | 'DOWNTIME_RECORD'
  | 'CONSUMPTION_RECORD'
  | 'WO_CLOSURE';

export interface FormTemplate {
  id: string;
  code: FormTemplateCode;
  name: string;
  description: string;
  fields: DynamicFormField[];
}
