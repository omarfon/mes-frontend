import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface Empresa {
  id: string;
  ruc: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface EmpresaSelectItem {
  id: string;
  ruc: string;
  name: string;
}

export interface CreateEmpresaDto {
  ruc: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface UpdateEmpresaDto extends Partial<CreateEmpresaDto> {}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/empresas`;

  constructor(private http: HttpClient) {}

  /** Listado paginado completo */
  getAll(search?: string, active?: boolean): Observable<Empresa[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (active !== undefined) params = params.set('active', String(active));
    return this.http
      .get<Paginated<Empresa>>(this.url, { params })
      .pipe(map((r) => r.data || []));
  }

  /** Listado simplificado id/ruc/name para selectores */
  getSelectList(search?: string): Observable<EmpresaSelectItem[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<EmpresaSelectItem[]>(`${this.url}/list`, { params });
  }

  getById(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.url}/${id}`);
  }

  create(dto: CreateEmpresaDto): Observable<Empresa> {
    return this.http.post<Empresa>(this.url, dto);
  }

  update(id: string, dto: UpdateEmpresaDto): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.url}/${id}`, dto);
  }

  toggleActive(id: string, active: boolean): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.url}/${id}/active`, { active });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
