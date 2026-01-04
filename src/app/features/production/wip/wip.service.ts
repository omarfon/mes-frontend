import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface CreateWIPDto {
  ordenId: string;
  productoId: string;
  productoNombre: string;
  workCenterId?: string;
  workCenterNombre?: string;
  cantidadActual: number;
  unidadMedida: string;
  lote?: string;
  ubicacion?: string;
  fechaEntrada: string;
  movimientos?: any;
}

export interface WIP {
  id: string;
  ordenId: string;
  productoId: string;
  productoNombre: string;
  workCenterId?: string;
  workCenterNombre?: string;
  cantidadActual: number;
  unidadMedida: string;
  lote?: string;
  ubicacion?: string;
  fechaEntrada: string;
  movimientos?: any;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse {
  data: WIP[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WIPService {
  private apiUrl = `${environment.apiUrl}/production/wip`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<WIP[]> {
    return this.http.get<PaginatedResponse>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<WIP> {
    return this.http.get<WIP>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateWIPDto): Observable<WIP> {
    return this.http.post<WIP>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateWIPDto>): Observable<WIP> {
    return this.http.patch<WIP>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
