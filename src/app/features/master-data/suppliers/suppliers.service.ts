import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface Supplier {
  id: string;
  ruc: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateSupplierDto {
  ruc: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/suppliers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Paginated<Supplier>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.url}/${id}`);
  }

  create(dto: CreateSupplierDto): Observable<Supplier> {
    return this.http.post<Supplier>(this.url, dto);
  }

  update(id: string, dto: UpdateSupplierDto): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
