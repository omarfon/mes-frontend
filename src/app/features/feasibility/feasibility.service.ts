import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environmets/environments';

export type FeasibilityStatus =
  | 'DRAFT'
  | 'EVALUATING'
  | 'FEASIBLE'
  | 'NOT_FEASIBLE'
  | 'QUOTED'
  | 'APPROVED'
  | 'REJECTED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface RouteStep {
  seq: number;
  workCenter: string;
  machineCode: string;
  machineName: string;
  operation: string;
  setupTimeMin: number;
  cycleTimeSec: number;
  estimatedHours: number;
  notes: string;
}

export interface MaterialLine {
  materialCode: string;
  materialName: string;
  qty: number;
  uom: string;
  unitCost: number;
  available: boolean;
  leadTimeDays: number;
}

export interface FeasibilityStudy {
  id: string;
  code: string;
  clientName: string;
  clientContact: string;
  requestDate: string;
  requiredDate: string;
  productName: string;
  productCode: string;
  description: string;
  quantity: number;
  uom: string;
  priority: Priority;
  status: FeasibilityStatus;
  // Evaluación técnica
  technicalNotes: string;
  hasMachineCapacity: boolean;
  hasTooling: boolean;
  hasMaterials: boolean;
  hasLabor: boolean;
  qualityRequirements: string;
  specialConditions: string;
  // Ruta de producción
  routeSteps: RouteStep[];
  // Materiales
  materials: MaterialLine[];
  // Tiempos
  estimatedSetupHours: number;
  estimatedProductionHours: number;
  estimatedTotalDays: number;
  proposedDeliveryDate: string;
  // Costos / cotización
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  margin: number;
  quotePrice: number;
  currency: string;
  // Resultado
  feasible: boolean | null;
  rejectionReason: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FeasibilityService {
  private apiUrl = `${environment.apiUrl}/feasibility`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FeasibilityStudy[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      // handle paginated or array response
    );
  }

  getById(id: string): Observable<FeasibilityStudy> {
    return this.http.get<FeasibilityStudy>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<FeasibilityStudy>): Observable<FeasibilityStudy> {
    return this.http.post<FeasibilityStudy>(this.apiUrl, data);
  }

  update(id: string, data: Partial<FeasibilityStudy>): Observable<FeasibilityStudy> {
    return this.http.patch<FeasibilityStudy>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
