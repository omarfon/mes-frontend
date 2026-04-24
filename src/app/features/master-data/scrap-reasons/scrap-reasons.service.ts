import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type ScrapClass = 'PROCESS' | 'MACHINE' | 'MATERIAL' | 'OPERATOR' | 'DESIGN' | 'OTHER';

export interface ScrapReason {
  id: string;
  code: string;
  name: string;
  classification: ScrapClass;
  description: string;
  affectsEfficiency: boolean;
  reportable: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScrapReasonDto {
  code: string;
  name: string;
  classification: ScrapClass;
  description?: string;
  affectsEfficiency?: boolean;
  reportable?: boolean;
  active?: boolean;
}

export interface UpdateScrapReasonDto extends Partial<CreateScrapReasonDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class ScrapReasonsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/scrap-reasons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ScrapReason[]> {
    return this.http.get<Paginated<ScrapReason>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<ScrapReason> {
    return this.http.get<ScrapReason>(`${this.url}/${id}`);
  }

  create(dto: CreateScrapReasonDto): Observable<ScrapReason> {
    return this.http.post<ScrapReason>(this.url, dto);
  }

  update(id: string, dto: UpdateScrapReasonDto): Observable<ScrapReason> {
    return this.http.patch<ScrapReason>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
