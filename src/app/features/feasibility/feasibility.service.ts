import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface HistoryRecord {
  id: string;
  studyCode: string;
  clientName: string;
  productName: string;
  quantity: number;
  uom: string;
  approvedDate: string;
  approvedBy: string;
  quotePrice: number;
  currency: string;
  resultType: 'PRODUCTION_ORDER' | 'PURCHASE_REQUEST';
  resultCode: string;
  resultDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  // Auditoría
  fechaCreacion?: string;
  usuCreacion?: string | null;
  fechaEdicion?: string;
  usuEdicion?: string | null;
}

export interface HistoryPage {
  data: HistoryRecord[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class FeasibilityService {
  private apiUrl = `${environment.apiUrl}/feasibility`;

  constructor(private http: HttpClient) {}

  getHistory(page = 1, limit = 10, search?: string, resultType?: string, status?: string): Observable<HistoryPage> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search)     params = params.set('search', search);
    if (resultType) params = params.set('resultType', resultType);
    if (status)     params = params.set('status', status);
    return this.http.get<HistoryPage>(`${this.apiUrl}/history`, { params });
  }

  getAll(): Observable<FeasibilityStudy[]> {
    return this.http.get<FeasibilityStudy[]>(this.apiUrl);
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
