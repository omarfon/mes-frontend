// src/app/shared/models/quality.model.ts

export enum DefectStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export interface Defect {
  id: string;
  code: string;
  name: string;
  familyId: string;
  severityId: string;
  description?: string;
  status?: string;
  productId?: string;
  productionOrderId?: string;
  inspectionId?: string;
  quantity?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDefectDto {
  code: string;
  name: string;
  familyId: string;
  severityId: string;
  description?: string;
  status?: string;
  productId?: string;
  productionOrderId?: string;
  inspectionId?: string;
  quantity?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateDefectDto {
  code?: string;
  name?: string;
  familyId?: string;
  severityId?: string;
  description?: string;
  status?: string;
  productId?: string;
  productionOrderId?: string;
  inspectionId?: string;
  quantity?: number;
  notes?: string;
  isActive?: boolean;
}

export interface DefectFamily {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDefectFamilyDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateDefectFamilyDto {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Severity {
  id: string;
  code: string;
  name: string;
  level: SeverityLevel;
  points: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSeverityDto {
  code: string;
  name: string;
  level: SeverityLevel;
  points: number;
  colorTag?: string;
}

export interface UpdateSeverityDto {
  code?: string;
  name?: string;
  level?: SeverityLevel;
  points?: number;
  colorTag?: string;
  isActive?: boolean;
}

export interface DefectFilters {
  status?: DefectStatus;
  familyId?: string;
  severityId?: string;
  productId?: string;
  productionOrderId?: string;
  inspectionId?: string;
  isActive?: boolean;
  search?: string;
}

// ===== ESTADÍSTICAS =====

export interface DefectsByFamilyStats {
  familyId: string;
  familyCode: string;
  familyName: string;
  count: number;
  percentage?: number;
}

export interface DefectsBySeverityStats {
  severityId: string;
  severityCode: string;
  severityName: string;
  severityLevel: SeverityLevel;
  count: number;
  percentage?: number;
}

export enum InspectionType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  IN_PROCESS = 'IN_PROCESS',
  FINISHED_GOOD = 'FINISHED_GOOD',
  // Alias para compatibilidad
  INCOMING = 'RAW_MATERIAL',
  FINAL = 'FINISHED_GOOD'
}

export enum InspectionResult {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  // Alias para compatibilidad
  APPROVED = 'PASSED',
  REJECTED = 'FAILED'
}

// Alias de estado de inspección (compatible con backend)
export type InspectionStatus = InspectionResult;

export interface TraceabilityNode {
  id: string;
  code: string;
  type: string;
  productId?: string | null;
  productionOrderId?: string | null;
  quantity: string;
  unitOfMeasure?: string | null;
  metadata?: any;
  manufacturingDate?: string | null;
  expirationDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Inspection {
  id: string;
  type: InspectionType;
  nodeId: string;
  node?: TraceabilityNode;
  status: InspectionStatus;
  inspectedQuantity: string | number;
  notes?: string | null;
  defects?: any[];
  inspectorId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Campos opcionales para compatibilidad con UI legacy
  code?: string;
  result?: InspectionResult;
  productId?: string;
  productionOrderId?: string;
  lotId?: string;
  quantityInspected?: number;
  quantityApproved?: number;
  quantityRejected?: number;
  inspectionDate?: Date;
  observations?: string;
  corrective_actions?: string;
}

export interface CreateInspectionDto {
  code: string;
  type: InspectionType;
  result?: InspectionResult;
  productId?: string;
  productionOrderId?: string;
  lotId?: string;
  quantityInspected?: number;
  quantityApproved?: number;
  quantityRejected?: number;
  inspectorId: string;
  inspectionDate: Date;
  observations?: string;
  corrective_actions?: string;
  // Campos opcionales compatibles con DTO del backend
  nodeId?: string;
  status?: InspectionStatus;
  inspectedQuantity?: number;
  notes?: string;
}

export interface UpdateInspectionDto {
  code?: string;
  type?: InspectionType;
  result?: InspectionResult;
  productId?: string;
  productionOrderId?: string;
  lotId?: string;
  quantityInspected?: number;
  quantityApproved?: number;
  quantityRejected?: number;
  inspectorId?: string;
  inspectionDate?: Date;
  observations?: string;
  corrective_actions?: string;
  // Campos opcionales compatibles con DTO del backend
  nodeId?: string;
  status?: InspectionStatus;
  inspectedQuantity?: number;
  notes?: string;
}