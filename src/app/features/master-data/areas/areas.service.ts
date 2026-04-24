import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type AreaType = 'PREPARATION' | 'SPINNING' | 'FINISHING' | 'QUALITY' | 'WAREHOUSE' | 'MAINTENANCE' | 'DYEING' | 'WEAVING' | 'OTHER';

export interface Area {
  id: string;
  code: string;
  name: string;
  plantCode: string;
  type: AreaType;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAreaDto {
  code: string;
  name: string;
  plantCode: string;
  type: AreaType;
  description?: string;
  active?: boolean;
}

export interface UpdateAreaDto extends Partial<CreateAreaDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class AreasService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/areas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Area[]> {
    return this.http.get<Paginated<Area>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Area> {
    return this.http.get<Area>(`${this.url}/${id}`);
  }

  create(dto: CreateAreaDto): Observable<Area> {
    return this.http.post<Area>(this.url, dto);
  }

  update(id: string, dto: UpdateAreaDto): Observable<Area> {
    return this.http.patch<Area>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
