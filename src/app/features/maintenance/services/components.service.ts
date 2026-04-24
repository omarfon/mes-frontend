import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum ComponentStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED',
  REPLACED = 'REPLACED'
}

export enum ComponentCriticality {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AssetComponent {
  id: string;
  code: string;
  name: string;
  assetCode?: string;
  assetName?: string;
  category?: string;
  status: ComponentStatus;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  criticality: ComponentCriticality;
  installDate?: Date;
  expectedLifeHours?: number;
  currentHours?: number;
  notes?: string;
  lastInspection?: Date;
  nextInspection?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateComponentDto {
  code: string;
  name: string;
  assetCode?: string;
  assetName?: string;
  category?: string;
  status?: ComponentStatus;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  criticality?: ComponentCriticality;
  installDate?: Date;
  expectedLifeHours?: number;
  currentHours?: number;
  notes?: string;
  lastInspection?: Date;
  nextInspection?: Date;
}

export interface UpdateComponentDto extends Partial<CreateComponentDto> {}

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/maintenance/components`;

  private componentsSubject = new BehaviorSubject<AssetComponent[]>([]);
  public components$ = this.componentsSubject.asObservable();

  loadComponents(): void {
    this.http.get<any[]>(this.baseUrl)
      .pipe(
        map(components => components.map(c => ({
          ...c,
          expectedLifeHours: c.expectedLifeHours != null ? Number(c.expectedLifeHours) : undefined,
          currentHours: c.currentHours != null ? Number(c.currentHours) : undefined,
          installDate: c.installDate ? new Date(c.installDate) : undefined,
          lastInspection: c.lastInspection ? new Date(c.lastInspection) : undefined,
          nextInspection: c.nextInspection ? new Date(c.nextInspection) : undefined,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined
        }) as AssetComponent)),
        tap(components => this.componentsSubject.next(components))
      )
      .subscribe({
        error: (err) => console.error('Error loading components:', err)
      });
  }

  getComponent(id: string): Observable<AssetComponent> {
    return this.http.get<AssetComponent>(`${this.baseUrl}/${id}`);
  }

  createComponent(dto: CreateComponentDto): Observable<AssetComponent> {
    return this.http.post<AssetComponent>(this.baseUrl, dto)
      .pipe(
        tap(() => this.loadComponents())
      );
  }

  updateComponent(id: string, dto: UpdateComponentDto): Observable<AssetComponent> {
    return this.http.patch<AssetComponent>(`${this.baseUrl}/${id}`, dto)
      .pipe(
        tap(() => this.loadComponents())
      );
  }

  deleteComponent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(() => this.loadComponents())
      );
  }
}
