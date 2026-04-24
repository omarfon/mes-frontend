import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type WorkstationType = 'MANUAL' | 'SEMI_AUTO' | 'AUTOMATED';

export interface Workstation {
  id: string;
  code: string;
  name: string;
  workCenterCode: string;
  type: WorkstationType;
  asset: string;
  operatorSlots: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkstationDto {
  code: string;
  name: string;
  workCenterCode: string;
  type: WorkstationType;
  asset?: string;
  operatorSlots?: number;
  active?: boolean;
}

export interface UpdateWorkstationDto extends Partial<CreateWorkstationDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class WorkstationsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/workstations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Workstation[]> {
    return this.http.get<Paginated<Workstation>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Workstation> {
    return this.http.get<Workstation>(`${this.url}/${id}`);
  }

  create(dto: CreateWorkstationDto): Observable<Workstation> {
    return this.http.post<Workstation>(this.url, dto);
  }

  update(id: string, dto: UpdateWorkstationDto): Observable<Workstation> {
    return this.http.patch<Workstation>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
