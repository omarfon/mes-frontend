import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum TipoProceso {
  MANUFACTURA = 'MANUFACTURA',
  ENSAMBLE = 'ENSAMBLE',
  INSPECCION = 'INSPECCION',
  EMPAQUE = 'EMPAQUE',
  TRANSPORTE = 'TRANSPORTE',
  ALMACENAMIENTO = 'ALMACENAMIENTO',
  OTRO = 'OTRO'
}

export enum EstadoProceso {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  EN_REVISION = 'EN_REVISION',
  OBSOLETO = 'OBSOLETO'
}

export interface Proceso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  tipo: TipoProceso;
  estado?: EstadoProceso | null;
  version?: string | null;
  tiempoEstandarMinutos?: number | null;
  tiempoSetupMinutos?: number | null;
  instrucciones?: string | null;
  requisitosCalidad?: string | null;
  parametros?: Record<string, any> | null;
  recursos?: string[] | null;
  habilidadesRequeridas?: string[] | null;
  workCenterId?: string | null;
  productoId?: string | null;
  rutaId?: string | null;
  secuencia?: number | null;
  documentos?: Array<{ nombre: string; tipo: string; url: string }> | null;
  puntosCriticos?: string[] | null;
  riesgos?: string[] | null;
  eficienciaEsperada?: number | null;
  costoEstandar?: number | null;
  notas?: string | null;
  procesoPadreId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateProcesoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoProceso;
  estado?: EstadoProceso;
  version?: string;
  tiempoEstandarMinutos?: number;
  tiempoSetupMinutos?: number;
  instrucciones?: string;
  requisitosCalidad?: string;
  secuencia?: number;
  eficienciaEsperada?: number;
  costoEstandar?: number;
  notas?: string;
}

export interface UpdateProcesoDto extends Partial<CreateProcesoDto> {}

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
export class ProcessesService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.masterData}/procesos`;

  constructor(private http: HttpClient) {
    console.log('ProcessesService initialized. API URL:', this.apiUrl);
  }

  getAll(): Observable<Proceso[]> {
    console.log('GET all processes:', this.apiUrl);
    return this.http.get<PaginatedResponse<Proceso>>(this.apiUrl).pipe(
      map(response => {
        console.log('Paginated response received:', response);
        return response.data || [];
      })
    );
  }

  getById(id: string): Observable<Proceso> {
    console.log('GET process by id:', id);
    return this.http.get<Proceso>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateProcesoDto): Observable<Proceso> {
    console.log('POST create process:', this.apiUrl, data);
    return this.http.post<Proceso>(this.apiUrl, data);
  }

  update(id: string, data: UpdateProcesoDto): Observable<Proceso> {
    console.log('PATCH update process:', id, data);
    return this.http.patch<Proceso>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    console.log('DELETE process:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
