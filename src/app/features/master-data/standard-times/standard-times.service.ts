import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface StandardTime {
  id: string;
  operationCode: string;
  operationName: string;
  productCode: string;
  workCenterCode: string;
  setupMin: number;
  cycleMin: number;
  timePerUnitMin: number;
  batchSize: number;
  efficiencyPct: number;
  validFrom: string;
  active: boolean;
  notes: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateStandardTimeDto {
  operationCode: string;
  operationName: string;
  productCode: string;
  workCenterCode: string;
  setupMin?: number;
  cycleMin?: number;
  timePerUnitMin?: number;
  batchSize?: number;
  efficiencyPct?: number;
  validFrom?: string;
  active?: boolean;
  notes?: string;
}

export interface UpdateStandardTimeDto extends Partial<CreateStandardTimeDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class StandardTimesService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/standard-times`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StandardTime[]> {
    return this.http.get<Paginated<StandardTime>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<StandardTime> {
    return this.http.get<StandardTime>(`${this.url}/${id}`);
  }

  create(dto: CreateStandardTimeDto): Observable<StandardTime> {
    return this.http.post<StandardTime>(this.url, dto);
  }

  update(id: string, dto: UpdateStandardTimeDto): Observable<StandardTime> {
    return this.http.patch<StandardTime>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
