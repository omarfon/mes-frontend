import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum TipoDespacho {
  CLIENTE = 'CLIENTE',
  TRANSFERENCIA = 'TRANSFERENCIA',
  DEVOLUCION = 'DEVOLUCION',
  MUESTRAS = 'MUESTRAS',
  OTRO = 'OTRO'
}

export enum EstadoDespacho {
  PENDIENTE = 'PENDIENTE',
  PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO',
  EN_TRANSITO = 'EN_TRANSITO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

export interface CreateDespachoDto {
  numeroDespacho: string;
  ordenId?: string;
  tipo?: TipoDespacho;
  estado?: EstadoDespacho;
  destino: string;
  direccion?: string;
  contacto?: string;
  telefono?: string;
  fechaProgramada?: string;
  items: any[];
  pesoTotal?: number;
  volumenTotal?: number;
  transportista?: string;
  numeroGuia?: string;
  vehiculo?: string;
  conductor?: string;
  documentos?: any;
  observaciones?: string;
  preparadoPor?: string;
}

export interface Despacho {
  id: string;
  numeroDespacho: string;
  ordenId?: string;
  tipo?: TipoDespacho;
  estado: EstadoDespacho;
  destino: string;
  direccion?: string;
  contacto?: string;
  telefono?: string;
  fechaProgramada?: string;
  fechaReal?: string;
  items: any[];
  pesoTotal?: number;
  volumenTotal?: number;
  transportista?: string;
  numeroGuia?: string;
  vehiculo?: string;
  conductor?: string;
  documentos?: any;
  observaciones?: string;
  preparadoPor?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse {
  data: Despacho[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class DespachosService {
  private apiUrl = `${environment.apiUrl}/production/despacho`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Despacho[]> {
    return this.http.get<PaginatedResponse>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<Despacho> {
    return this.http.get<Despacho>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateDespachoDto): Observable<Despacho> {
    return this.http.post<Despacho>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateDespachoDto): Observable<Despacho> {
    return this.http.patch<Despacho>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
