import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type LocationType = 'WAREHOUSE' | 'LINE' | 'STATION';

export interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  parent?: string;
  parentCode?: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateLocationDto {
  code: string;
  name: string;
  type: LocationType;
  parent?: string;
  active?: boolean;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/locations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Location[]> {
    return this.http.get<Paginated<Location>>(this.url).pipe(
      map(r => (r.data || []).map(item => ({ ...item, parent: item.parent ?? item.parentCode ?? '' })))
    );
  }

  getById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.url}/${id}`).pipe(
      map(item => ({ ...item, parent: item.parent ?? item.parentCode ?? '' }))
    );
  }

  create(dto: CreateLocationDto): Observable<Location> {
    return this.http.post<Location>(this.url, dto);
  }

  update(id: string, dto: UpdateLocationDto): Observable<Location> {
    return this.http.patch<Location>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
