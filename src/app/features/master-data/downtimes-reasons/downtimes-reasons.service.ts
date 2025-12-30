import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum CategoriaParada {
  PLANIFICADA = 'PLANIFICADA',
  NO_PLANIFICADA = 'NO_PLANIFICADA',
  MANTENIMIENTO = 'MANTENIMIENTO',
  PRODUCCION = 'PRODUCCION',
  CALIDAD = 'CALIDAD',
  MATERIALES = 'MATERIALES',
  PERSONAL = 'PERSONAL',
  OTROS = 'OTROS'
}

export enum TipoParada {
  CORTA = 'CORTA',
  MEDIA = 'MEDIA',
  LARGA = 'LARGA'
}

export interface DowntimeReason {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoria: CategoriaParada;
  tipo?: TipoParada | null;
  requiereAprobacion?: boolean;
  requiereComentario?: boolean;
  requiereEvidencia?: boolean;
  color?: string | null;
  icono?: string | null;
  tiempoEstandardMinutos?: number | null;
  prioridad?: number | null;
  impactaOEE?: boolean;
  departamentoResponsable?: string | null;
  accionesCorrectivas?: string[] | null;
  activo?: boolean;
  motivoPadreId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateDowntimeReasonDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaParada;
  tipo?: TipoParada;
  requiereAprobacion?: boolean;
  requiereComentario?: boolean;
  requiereEvidencia?: boolean;
  color?: string;
  icono?: string;
  tiempoEstandardMinutos?: number;
  prioridad?: number;
  impactaOEE?: boolean;
  departamentoResponsable?: string;
  accionesCorrectivas?: string[];
  activo?: boolean;
  motivoPadreId?: string;
}

export interface UpdateDowntimeReasonDto extends Partial<CreateDowntimeReasonDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class DowntimeReasonsService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.masterData}/motivos-parada`;

  constructor(private http: HttpClient) {
    console.log('DowntimeReasonsService initialized. API URL:', this.apiUrl);
  }

  getAll(): Observable<DowntimeReason[]> {
    console.log('GET all downtime reasons:', this.apiUrl);
    return this.http.get<PaginatedResponse<DowntimeReason>>(this.apiUrl).pipe(
      map(response => {
        console.log('Paginated response received:', response);
        return response.data || [];
      })
    );
  }

  getById(id: string): Observable<DowntimeReason> {
    console.log('GET downtime reason by id:', id);
    return this.http.get<DowntimeReason>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateDowntimeReasonDto): Observable<DowntimeReason> {
    console.log('POST create downtime reason:', this.apiUrl, data);
    return this.http.post<DowntimeReason>(this.apiUrl, data);
  }

  update(id: string, data: UpdateDowntimeReasonDto): Observable<DowntimeReason> {
    console.log('PATCH update downtime reason:', id, data);
    return this.http.patch<DowntimeReason>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    console.log('DELETE downtime reason:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}