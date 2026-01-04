import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface Lot {
  id: string;
  code: string;
  numero?: string;
  description?: string;
  descripcion?: string;
  quantity?: number;
  qty?: number;
  unitOfMeasure?: string;
  uom?: string;
  status?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
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
export class LotsService {
  private apiUrl = `${environment.apiUrl}/traceability/lots`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Lot[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Manejar respuesta paginada o array directo
        if (Array.isArray(response)) {
          console.log('📦 Lotes (array directo):', response.length);
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          console.log('📦 Lotes (paginado):', response.data.length);
          return response.data;
        }
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        return [];
      })
    );
  }

  getById(id: string): Observable<Lot> {
    return this.http.get<Lot>(`${this.apiUrl}/${id}`);
  }
}
