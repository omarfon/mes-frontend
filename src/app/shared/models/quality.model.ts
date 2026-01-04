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
  INCOMING = 'INCOMING',
  IN_PROCESS = 'IN_PROCESS',
  FINAL = 'FINAL',
  OUTGOING = 'OUTGOING'
}

export enum InspectionResult {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONDITIONAL = 'CONDITIONAL'
}

export interface Inspection {
  id: string;
  code: string;
  type: InspectionType;
  result: InspectionResult;
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
  createdAt: Date;
  updatedAt: Date;
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
}