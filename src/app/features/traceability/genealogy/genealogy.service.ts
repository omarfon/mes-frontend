import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum RelationType {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  COMPONENT = 'COMPONENT',
  CONSUMED = 'CONSUMED',
  PRODUCED = 'PRODUCED',
  SIBLING = 'SIBLING',
}

export interface CreateLotGenealogyDto {
  parentLotId: string;
  childLotId: string;
  relationType: RelationType;
  quantity: number;
  unitOfMeasure?: string;
  notes?: string;
  workOrderId?: string;
}

export interface LotGenealogy {
  id: string;
  parentLotId: string;
  childLotId: string;
  relationType: RelationType;
  quantity: number;
  unitOfMeasure?: string;
  notes?: string;
  workOrderId?: string;
  activo: boolean;
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
export class GenealogyService {
  private apiUrl = `${environment.apiUrl}/traceability/lot-genealogy`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LotGenealogy[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Manejar respuesta paginada o array directo
        if (Array.isArray(response)) {
          console.log('📦 Genealogías (array directo):', response.length);
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          console.log('📦 Genealogías (paginado):', response.data.length);
          return response.data;
        }
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        return [];
      })
    );
  }

  getById(id: string): Observable<LotGenealogy> {
    return this.http.get<LotGenealogy>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateLotGenealogyDto): Observable<LotGenealogy> {
    return this.http.post<LotGenealogy>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateLotGenealogyDto>): Observable<LotGenealogy> {
    return this.http.patch<LotGenealogy>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos específicos para genealogía
  getUpstream(lotId: string): Observable<LotGenealogy[]> {
    return this.http.get<PaginatedResponse<LotGenealogy>>(`${this.apiUrl}/upstream/${lotId}`).pipe(
      map(response => response.data || [])
    );
  }

  getDownstream(lotId: string): Observable<LotGenealogy[]> {
    return this.http.get<PaginatedResponse<LotGenealogy>>(`${this.apiUrl}/downstream/${lotId}`).pipe(
      map(response => response.data || [])
    );
  }
}
