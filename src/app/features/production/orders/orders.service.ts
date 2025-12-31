import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  LIBERADA = 'LIBERADA',
  EN_PROCESO = 'EN_PROCESO',
  PAUSADA = 'PAUSADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}

export enum PrioridadOrden {
  BAJA = 'BAJA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

export interface CreateOrdenDto {
  numeroOrden: string;
  productoId?: string; // UUID autogenerado desde código o proporcionado manualmente
  productoCodigo?: string; // Código del producto (alternativa a productoId)
  productoNombre?: string;
  cantidadPlanificada: number;
  unidadMedida: string;
  estado?: EstadoOrden;
  prioridad?: PrioridadOrden;
  fechaInicioPlanificada?: string;
  fechaFinPlanificada?: string;
  rutaId?: string;
  workCenterId?: string;
  turnoId?: string;
  lote?: string;
  cliente?: string;
  pedidoCliente?: string;
  notas?: string;
  documentos?: any;
  parametros?: any;
  creadoPor?: string;
}

export interface Orden {
  id: string;
  numeroOrden: string;
  productoId: string;
  productoCodigo?: string;
  productoNombre?: string;
  cantidadPlanificada: number;
  cantidadProducida?: number;
  unidadMedida: string;
  estado: EstadoOrden;
  prioridad?: PrioridadOrden;
  fechaInicioPlanificada?: string;
  fechaFinPlanificada?: string;
  fechaInicioReal?: string;
  fechaFinReal?: string;
  rutaId?: string;
  workCenterId?: string;
  turnoId?: string;
  lote?: string;
  cliente?: string;
  pedidoCliente?: string;
  notas?: string;
  documentos?: any;
  parametros?: any;
  creadoPor?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse {
  data: Orden[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private apiUrl = `${environment.apiUrl}/production/ordenes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Orden[]> {
    return this.http.get<PaginatedResponse>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<Orden> {
    return this.http.get<Orden>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateOrdenDto): Observable<Orden> {
    return this.http.patch<Orden>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
