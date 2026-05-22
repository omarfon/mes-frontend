import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface RoutingStep {
  id?: string;
  seq: number;
  operationCode: string;
  operationName: string;
  workCenterCode: string;
  setupMin: number;
  cycleMin: number;
  qtyPerCycle: number;
  mandatory: boolean;
  notes: string;
}

export interface Routing {
  id: string;
  code: string;
  name: string;
  productCode: string;
  version: string;
  active: boolean;
  steps: RoutingStep[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateRoutingDto {
  code: string;
  name: string;
  productCode: string;
  version?: string;
  active?: boolean;
}

export interface UpdateRoutingDto extends Partial<CreateRoutingDto> {}

export interface CreateRoutingStepDto {
  seq: number;
  operationCode: string;
  operationName: string;
  workCenterCode: string;
  setupMin?: number;
  cycleMin?: number;
  qtyPerCycle?: number;
  mandatory?: boolean;
  notes?: string;
}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class RoutingsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/routings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Routing[]> {
    return this.http.get<Paginated<Routing>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Routing> {
    return this.http.get<Routing>(`${this.url}/${id}`);
  }

  create(dto: CreateRoutingDto): Observable<Routing> {
    return this.http.post<Routing>(this.url, dto);
  }

  update(id: string, dto: UpdateRoutingDto): Observable<Routing> {
    return this.http.patch<Routing>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Sub-resource: steps
  getSteps(routingId: string): Observable<RoutingStep[]> {
    return this.http.get<RoutingStep[]>(`${this.url}/${routingId}/steps`);
  }

  addStep(routingId: string, dto: CreateRoutingStepDto): Observable<RoutingStep> {
    return this.http.post<RoutingStep>(`${this.url}/${routingId}/steps`, dto);
  }

  updateStep(routingId: string, stepId: string, dto: Partial<CreateRoutingStepDto>): Observable<RoutingStep> {
    return this.http.patch<RoutingStep>(`${this.url}/${routingId}/steps/${stepId}`, dto);
  }

  deleteStep(routingId: string, stepId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${routingId}/steps/${stepId}`);
  }
}
