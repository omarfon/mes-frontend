import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type OperatorRole = 'OPERATOR' | 'SUPERVISOR' | 'QUALITY';

export interface Operator {
  id: string;
  code: string;
  fullName: string;
  role: OperatorRole;
  shiftCode: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateOperatorDto {
  code: string;
  fullName: string;
  role: OperatorRole;
  shiftCode?: string;
  active?: boolean;
}

export interface UpdateOperatorDto extends Partial<CreateOperatorDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class OperatorsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/operators`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Operator[]> {
    return this.http.get<Paginated<Operator>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Operator> {
    return this.http.get<Operator>(`${this.url}/${id}`);
  }

  create(dto: CreateOperatorDto): Observable<Operator> {
    return this.http.post<Operator>(this.url, dto);
  }

  update(id: string, dto: UpdateOperatorDto): Observable<Operator> {
    return this.http.patch<Operator>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
