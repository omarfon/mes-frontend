import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface ShiftGroup {
  id: string;
  code: string;
  name: string;
  plantCode: string;
  shiftCodes: string;
  supervisorCode: string;
  headcount: number;
  notes: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShiftGroupDto {
  code: string;
  name: string;
  plantCode: string;
  shiftCodes?: string;
  supervisorCode?: string;
  headcount?: number;
  notes?: string;
  active?: boolean;
}

export interface UpdateShiftGroupDto extends Partial<CreateShiftGroupDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class ShiftGroupsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/shift-groups`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ShiftGroup[]> {
    return this.http.get<Paginated<ShiftGroup>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<ShiftGroup> {
    return this.http.get<ShiftGroup>(`${this.url}/${id}`);
  }

  create(dto: CreateShiftGroupDto): Observable<ShiftGroup> {
    return this.http.post<ShiftGroup>(this.url, dto);
  }

  update(id: string, dto: UpdateShiftGroupDto): Observable<ShiftGroup> {
    return this.http.patch<ShiftGroup>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
