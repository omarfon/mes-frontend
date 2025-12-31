import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum ProductType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  SEMI_FINISHED = 'SEMI_FINISHED',
  FINISHED = 'FINISHED',
  CONSUMABLE = 'CONSUMABLE',
  SPARE_PART = 'SPARE_PART',
  TOOL = 'TOOL',
  PACKAGING = 'PACKAGING',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER'
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  type?: ProductType;
  unitOfMeasure?: string;
  family?: string;
  subfamily?: string;
  erpCode?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  type?: ProductType;
  unitOfMeasure?: string;
  family?: string;
  subfamily?: string;
  erpCode?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/master-data/productos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<PaginatedResponse>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateProductDto): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
