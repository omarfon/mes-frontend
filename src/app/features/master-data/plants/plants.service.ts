import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface Plant {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  timezone: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreatePlantDto {
  code: string;
  name: string;
  country: string;
  city: string;
  timezone: string;
  active?: boolean;
}

export interface UpdatePlantDto extends Partial<CreatePlantDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class PlantsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/plants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Plant[]> {
    return this.http.get<Paginated<Plant>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Plant> {
    return this.http.get<Plant>(`${this.url}/${id}`);
  }

  create(dto: CreatePlantDto): Observable<Plant> {
    return this.http.post<Plant>(this.url, dto);
  }

  update(id: string, dto: UpdatePlantDto): Observable<Plant> {
    return this.http.patch<Plant>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
