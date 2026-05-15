import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export enum ProductType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  SEMI_FINISHED = 'SEMI_FINISHED',
  FINISHED = 'FINISHED',
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
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPage {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

/** Ítem simplificado para selectores */
export interface ProductSelectItem {
  id: string;
  code: string;
  name: string;
  unitOfMeasure?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.masterData}/products`;

  constructor(private http: HttpClient) {}

  getPaginated(page = 1, limit = 10, search?: string): Observable<ProductPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (search) params = params.set('search', search);
    return this.http.get<ProductPage>(this.apiUrl, { params });
  }

  getSelectList(search?: string): Observable<ProductSelectItem[]> {
    let params = new HttpParams().set('page', '1').set('limit', '100');
    if (search) params = params.set('search', search);
    return this.http.get<ProductPage>(this.apiUrl, { params }).pipe(
      map(r => r.data.map(p => ({ id: p.id, code: p.code, name: p.name, unitOfMeasure: p.unitOfMeasure })))
    );
  }

  getAll(): Observable<Product[]> {
    return this.getPaginated(1, 100).pipe(map(r => r.data));
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
