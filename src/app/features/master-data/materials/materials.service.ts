import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type MaterialType = 'RAW' | 'WIP' | 'FINISHED';

export interface Material {
  id: string;
  code: string;
  name: string;
  type: MaterialType;
  uom: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialDto {
  code: string;
  name: string;
  type: MaterialType;
  uom?: string;
  active?: boolean;
}

export interface UpdateMaterialDto extends Partial<CreateMaterialDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/materials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Material[]> {
    return this.http.get<Paginated<Material>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.url}/${id}`);
  }

  create(dto: CreateMaterialDto): Observable<Material> {
    return this.http.post<Material>(this.url, dto);
  }

  update(id: string, dto: UpdateMaterialDto): Observable<Material> {
    return this.http.patch<Material>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
