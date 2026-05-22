import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface OrderType {
  id: string;
  code: string;
  name: string;
  description: string;
  priority: OrderPriority;
  color: string;
  allowsRework: boolean;
  requiresQA: boolean;
  requiresRelease: boolean;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateOrderTypeDto {
  code: string;
  name: string;
  description?: string;
  priority?: OrderPriority;
  color?: string;
  allowsRework?: boolean;
  requiresQA?: boolean;
  requiresRelease?: boolean;
  active?: boolean;
}

export interface UpdateOrderTypeDto extends Partial<CreateOrderTypeDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class OrderTypesService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/order-types`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrderType[]> {
    return this.http.get<Paginated<OrderType>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<OrderType> {
    return this.http.get<OrderType>(`${this.url}/${id}`);
  }

  create(dto: CreateOrderTypeDto): Observable<OrderType> {
    return this.http.post<OrderType>(this.url, dto);
  }

  update(id: string, dto: UpdateOrderTypeDto): Observable<OrderType> {
    return this.http.patch<OrderType>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
