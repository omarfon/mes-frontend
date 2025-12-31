import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface Shift {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  crossesMidnight?: boolean;
  breakMinutes?: number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateShiftDto {
  code: string;
  name: string;
  description?: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  crossesMidnight?: boolean;
  breakMinutes?: number;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ShiftsService {
  // Cambia 'turnos' por el endpoint correcto de tu backend
  // Puede ser: /shifts, /shift, /turnos, etc.
  private apiUrl = `${environment.apiUrl}${environment.endpoints.masterData}/shifts`;

  constructor(private http: HttpClient) {
    console.log('ShiftsService initialized. API URL:', this.apiUrl);
  }

  getAll(): Observable<Shift[]> {
    console.log('GET all shifts:', this.apiUrl);
    return this.http.get<PaginatedResponse<Shift>>(this.apiUrl).pipe(
      map(response => {
        console.log('Paginated response received:', response);
        return response.data || [];
      })
    );
  }

  getById(id: string): Observable<Shift> {
    console.log('GET shift by id:', id);
    return this.http.get<Shift>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateShiftDto): Observable<Shift> {
    console.log('POST create shift:', this.apiUrl, data);
    return this.http.post<Shift>(this.apiUrl, data);
  }

  update(id: string, data: UpdateShiftDto): Observable<Shift> {
    console.log('PATCH update shift:', id, data);
    return this.http.patch<Shift>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    console.log('DELETE shift:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
