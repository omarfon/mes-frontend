import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum EstadoEjecucion {
  INICIADA = 'INICIADA',
  EN_PROCESO = 'EN_PROCESO',
  PAUSADA = 'PAUSADA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

export interface CreateEjecucionDto {
  ordenId: string;
  maquinaId: string;
  operadorId: string;
  estado?: EstadoEjecucion;
  fechaInicio?: string;
  parametros?: any;
  observaciones?: string;
}

export interface Ejecucion {
  id: string;
  ordenId: string;
  maquinaId: string;
  operadorId: string;
  estado: EstadoEjecucion;
  fechaInicio: string;
  fechaFin?: string;
  parametros?: any;
  observaciones?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  maquina?: { id: string; code: string; name: string; };
  operador?: { id: string; codigo: string; nombre: string; };
}

interface PaginatedResponse {
  data: Ejecucion[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class EjecucionesService {
  private apiUrl = `${environment.apiUrl}/production/ejecucion`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ejecucion[]> {
    return this.http.get<PaginatedResponse>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getPage(page: number, limit: number, search?: string): Observable<PaginatedResponse> {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (search?.trim()) params['search'] = search.trim();
    return this.http.get<PaginatedResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Ejecucion> {
    return this.http.get<Ejecucion>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateEjecucionDto): Observable<Ejecucion> {
    return this.http.post<Ejecucion>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateEjecucionDto): Observable<Ejecucion> {
    return this.http.patch<Ejecucion>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
