import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type WorkCenterType = 'LINE' | 'CELL' | 'WORK_CENTER';

export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  areaCode: string;
  type: WorkCenterType;
  capacityPcsPerHour: number | null;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkCenterDto {
  code: string;
  name: string;
  areaCode: string;
  type: WorkCenterType;
  capacityPcsPerHour?: number | null;
  description?: string;
  active?: boolean;
}

export interface UpdateWorkCenterDto extends Partial<CreateWorkCenterDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class WorkCentersService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/work-centers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkCenter[]> {
    return this.http.get<Paginated<WorkCenter>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<WorkCenter> {
    return this.http.get<WorkCenter>(`${this.url}/${id}`);
  }

  create(dto: CreateWorkCenterDto): Observable<WorkCenter> {
    return this.http.post<WorkCenter>(this.url, dto);
  }

  update(id: string, dto: UpdateWorkCenterDto): Observable<WorkCenter> {
    return this.http.patch<WorkCenter>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
