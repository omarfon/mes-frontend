import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
  private readonly requestedLimit = 100;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Orden[]> {
    return this.getPage(1, this.requestedLimit).pipe(
      switchMap((firstPage) => {
        const totalPages = this.getTotalPages(firstPage);

        if (totalPages <= 1) {
          return of(this.getPageData(firstPage));
        }

        const requests = Array.from({ length: totalPages - 1 }, (_, index) =>
          this.getPage(index + 2, this.requestedLimit)
        );

        return forkJoin([of(firstPage), ...requests]).pipe(
          map((responses) => responses.flatMap((response) => this.getPageData(response)))
        );
      })
    );
  }

  private getPage(page: number, limit: number): Observable<PaginatedResponse> {
    return this.http.get<PaginatedResponse>(this.apiUrl, {
      params: { limit: String(limit), page: String(page) }
    });
  }

  private getPageData(response: PaginatedResponse): Orden[] {
    return Array.isArray(response?.data) ? response.data : [];
  }

  private getTotalPages(response: PaginatedResponse): number {
    const metaPages = response?.meta?.totalPages;
    if (Number.isFinite(metaPages) && metaPages > 0) {
      return metaPages;
    }

    const total = response?.meta?.total;
    const limit = response?.meta?.limit || this.requestedLimit;

    if (Number.isFinite(total) && total > 0 && Number.isFinite(limit) && limit > 0) {
      return Math.ceil(total / limit);
    }

    return 1;
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
