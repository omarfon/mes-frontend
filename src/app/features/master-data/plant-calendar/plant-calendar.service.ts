import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type CalEntryType = 'HOLIDAY' | 'PLANNED_STOP' | 'EXTRA_SHIFT' | 'MAINTENANCE_WINDOW';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface CalEntry {
  id: string;
  date: string;
  type: CalEntryType;
  name: string;
  plantCode: string;
  affectsAll: boolean;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCalEntryDto {
  date: string;
  type: CalEntryType;
  name: string;
  plantCode: string;
  affectsAll?: boolean;
  notes?: string;
}

export interface UpdateCalEntryDto extends Partial<CreateCalEntryDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class PlantCalendarService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/plant-calendar`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CalEntry[]> {
    return this.http.get<Paginated<CalEntry>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<CalEntry> {
    return this.http.get<CalEntry>(`${this.url}/${id}`);
  }

  create(dto: CreateCalEntryDto): Observable<CalEntry> {
    return this.http.post<CalEntry>(this.url, dto);
  }

  update(id: string, dto: UpdateCalEntryDto): Observable<CalEntry> {
    return this.http.patch<CalEntry>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
