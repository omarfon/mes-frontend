import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum TipoUnidadMedida {
  LONGITUD = 'LONGITUD',
  MASA = 'MASA',
  VOLUMEN = 'VOLUMEN',
  TIEMPO = 'TIEMPO',
  CANTIDAD = 'CANTIDAD',
  AREA = 'AREA',
  VELOCIDAD = 'VELOCIDAD',
  PRESION = 'PRESION',
  ENERGIA = 'ENERGIA',
  OTRO = 'OTRO'
}

export interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  simbolo: string;
  tipo: TipoUnidadMedida;
  descripcion?: string | null;
  factorConversion?: number | null;
  unidadBaseId?: string | null;
  esSI?: boolean;
  activo?: boolean;
  decimales?: number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateUnidadMedidaDto {
  codigo: string;
  nombre: string;
  simbolo: string;
  tipo: TipoUnidadMedida;
  descripcion?: string;
  factorConversion?: number;
  unidadBaseId?: string;
  esSI?: boolean;
  activo?: boolean;
  decimales?: number;
}

export interface UpdateUnidadMedidaDto extends Partial<CreateUnidadMedidaDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class UomsService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.masterData}/unidades-medida`;

  constructor(private http: HttpClient) {
    console.log('UomsService initialized. API URL:', this.apiUrl);
  }

  getAll(): Observable<UnidadMedida[]> {
    console.log('GET all UoMs:', this.apiUrl);
    return this.http.get<PaginatedResponse<UnidadMedida>>(this.apiUrl).pipe(
      map(response => {
        console.log('Paginated response received:', response);
        return response.data || [];
      })
    );
  }

  getById(id: string): Observable<UnidadMedida> {
    console.log('GET UoM by id:', id);
    return this.http.get<UnidadMedida>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUnidadMedidaDto): Observable<UnidadMedida> {
    console.log('POST create UoM:', this.apiUrl, data);
    return this.http.post<UnidadMedida>(this.apiUrl, data);
  }

  update(id: string, data: UpdateUnidadMedidaDto): Observable<UnidadMedida> {
    console.log('PATCH update UoM:', id, data);
    return this.http.patch<UnidadMedida>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    console.log('DELETE UoM:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
