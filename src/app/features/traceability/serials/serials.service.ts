import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum SerialStatus {
  CREATED = 'CREATED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED',
  IN_QUARANTINE = 'IN_QUARANTINE',
  RELEASED = 'RELEASED',
  BLOCKED = 'BLOCKED',
  SHIPPED = 'SHIPPED',
  SOLD = 'SOLD',
  RETURNED = 'RETURNED',
  SCRAPPED = 'SCRAPPED',
}

export interface CreateSerialDto {
  serialNumber: string;
  lotId: string;
  productId: string;
  status?: SerialStatus;
  macAddress?: string;
  imei?: string;
  firmwareVersion?: string;
  hardwareRevision?: string;
  warrantyStartDate?: Date | string;
  warrantyEndDate?: Date | string;
  warrantyMonths?: number;
  manufacturedDate?: Date | string;
  shippedDate?: Date | string;
  customerId?: string;
  notes?: string;
}

export interface Serial extends CreateSerialDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SerialsService {
  private apiUrl = `${environment.apiUrl}/traceability/serials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Serial[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          console.log('📦 Seriales (array directo):', response.length);
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          console.log('📦 Seriales (paginado):', response.data.length);
          return response.data;
        }
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        return [];
      }),
      catchError(err => {
        // Si es 401, devolver array vacío sin propagar el error
        if (err.status === 401) {
          console.log('ℹ️ Endpoint /serials requiere autenticación - devolviendo array vacío');
          return of([]);
        }
        // Para otros errores, propagar
        throw err;
      })
    );
  }

  getById(id: string): Observable<Serial> {
    return this.http.get<Serial>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateSerialDto): Observable<Serial> {
    return this.http.post<Serial>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateSerialDto>): Observable<Serial> {
    return this.http.patch<Serial>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Búsqueda por número de serie
  findBySerialNumber(serialNumber: string): Observable<Serial> {
    return this.http.get<Serial>(`${this.apiUrl}/search/${serialNumber}`);
  }

  // Búsqueda por lote
  findByLot(lotId: string): Observable<Serial[]> {
    return this.http.get<Serial[]>(`${this.apiUrl}/lot/${lotId}`);
  }
}
