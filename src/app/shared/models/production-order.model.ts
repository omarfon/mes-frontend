import { PaginationParams } from './common.model';

export enum ProductionOrderStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export interface ProductionOrder {
  id: string;
  code: string;
  externalCode?: string;
  productId: string;
  routeId: string;
  quantityPlanned: number;
  quantityProduced: number;
  unitOfMeasure: string;
  status: ProductionOrderStatus;
  priority?: number;
  mainWorkCenterId?: string;
  shiftId?: string;
  plannedStartDate?: string | Date;
  plannedEndDate?: string | Date;
  dueDate?: string | Date;
  actualStartDate?: string | Date;
  actualEndDate?: string | Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones
  product?: any;
  route?: any;
  mainWorkCenter?: any;
  shift?: any;
  operations?: ProductionOrderOperation[];
}

export interface ProductionOrderOperation {
  id: string;
  sequence: number;
  name: string;
  workCenterId?: string;
  machineId?: string;
  standardTimeMinutes?: number;
  status: ProductionOrderOperationStatus;
  actualStartDate?: Date;
  actualEndDate?: Date;
  quantityProduced?: number;
}

export enum ProductionOrderOperationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface CreateProductionOrderDto {
  code: string;
  externalCode?: string;
  productId: string;
  routeId: string;
  quantityPlanned: number;
  priority?: number;
  mainWorkCenterId?: string;
  shiftId?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateProductionOrderDto {
  code?: string;
  externalCode?: string;
  priority?: number;
  mainWorkCenterId?: string;
  shiftId?: string;
  quantityPlanned?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  dueDate?: string;
  notes?: string;
  status?: ProductionOrderStatus;
}

export interface ProductionOrderFilters extends PaginationParams {
  productId?: string;
  routeId?: string;
  mainWorkCenterId?: string;
  status?: ProductionOrderStatus;
  priority?: number;
  search?: string;
}

export interface UpdateProductionOrderStatusDto {
  status: ProductionOrderStatus;
}
