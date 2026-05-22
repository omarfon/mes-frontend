import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface ProductVariant {
  id: string;
  sku: string;
  productCode: string;
  color: string;
  size: string;
  presentation: string;
  barcode: string;
  netWeight: number | null;
  weightUnit: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateProductVariantDto {
  sku: string;
  productCode: string;
  color?: string;
  size?: string;
  presentation?: string;
  barcode?: string;
  netWeight?: number | null;
  weightUnit?: string;
  active?: boolean;
}

export interface UpdateProductVariantDto extends Partial<CreateProductVariantDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class ProductVariantsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/product-variants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductVariant[]> {
    return this.http.get<Paginated<ProductVariant>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<ProductVariant> {
    return this.http.get<ProductVariant>(`${this.url}/${id}`);
  }

  create(dto: CreateProductVariantDto): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(this.url, dto);
  }

  update(id: string, dto: UpdateProductVariantDto): Observable<ProductVariant> {
    return this.http.patch<ProductVariant>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
