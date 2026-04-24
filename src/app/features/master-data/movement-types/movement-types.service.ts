import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type MovCategory = 'CONSUMPTION' | 'SCRAP' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT' | 'RECEIPT';
export type MovDirection = 'IN' | 'OUT' | 'TRANSFER';

export interface MovementType {
  id: string;
  code: string;
  name: string;
  category: MovCategory;
  direction: MovDirection;
  affectsStock: boolean;
  requiresLot: boolean;
  requiresReason: boolean;
  autoConsumed: boolean;
  active: boolean;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMovementTypeDto {
  code: string;
  name: string;
  category: MovCategory;
  direction: MovDirection;
  affectsStock?: boolean;
  requiresLot?: boolean;
  requiresReason?: boolean;
  autoConsumed?: boolean;
  active?: boolean;
  notes?: string;
}

export interface UpdateMovementTypeDto extends Partial<CreateMovementTypeDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class MovementTypesService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/movement-types`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MovementType[]> {
    return this.http.get<Paginated<MovementType>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<MovementType> {
    return this.http.get<MovementType>(`${this.url}/${id}`);
  }

  create(dto: CreateMovementTypeDto): Observable<MovementType> {
    return this.http.post<MovementType>(this.url, dto);
  }

  update(id: string, dto: UpdateMovementTypeDto): Observable<MovementType> {
    return this.http.patch<MovementType>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
