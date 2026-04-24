import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type MachineStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type MachineType =
  | 'CNC' | 'INJECTION' | 'EXTRUSION' | 'PRESS' | 'LATHE'
  | 'WEAVING' | 'KNITTING' | 'DYEING' | 'CUTTING' | 'SEWING'
  | 'PACKAGING' | 'FILLING' | 'LABELING' | 'MIXING' | 'OVEN'
  | 'CONVEYOR' | 'ROBOT' | 'WELDING' | 'ASSEMBLY' | 'TESTING'
  | 'PRINTING' | 'DRYING' | 'COOLING' | 'COMPRESSOR' | 'PUMP'
  | 'OTHER';

export interface Machine {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type?: string | null;
  model?: string | null;
  brand?: string | null;
  serialNumber?: string | null;
  year?: number | null;
  location?: string | null;
  area?: string | null;
  workCenter?: string | null;
  workCenterId?: string | null;
  // Capacidad y producción
  nominalCapacity?: number | null;
  capacityUnit?: string | null;
  cycleTimeSec?: number | null;
  setupTimeMin?: number | null;
  // Mantenimiento
  maintenanceIntervalHours?: number | null;
  maintenanceIntervalDays?: number | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  maintenanceCostPerHour?: number | null;
  operatingCostPerHour?: number | null;
  avgDowntimeMin?: number | null;
  mtbfHours?: number | null;
  mttrMin?: number | null;
  // Energía
  powerKw?: number | null;
  voltageV?: number | null;
  // Flags
  isCritical?: boolean;
  requiresCalibration?: boolean;
  status: MachineStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMachineDto {
  code: string;
  name: string;
  status: MachineStatus;
  [key: string]: any;
}

export interface UpdateMachineDto extends Partial<CreateMachineDto> {}

@Injectable({ providedIn: 'root' })
export class MachinesService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.masterData}/machines`;

  constructor(private http: HttpClient) {
    console.log('MachinesService initialized. API URL:', this.apiUrl);
  }

  getAll(): Observable<Machine[]> {
    console.log('GET all machines:', this.apiUrl);
    return this.http.get<PaginatedResponse<Machine>>(this.apiUrl).pipe(
      map(response => {
        console.log('Paginated response received:', response);
        console.log('Extracting data array:', response.data);
        return response.data || [];
      })
    );
  }

  getById(id: string): Observable<Machine> {
    console.log('GET machine by id:', id);
    return this.http.get<Machine>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateMachineDto): Observable<Machine> {
    console.log('POST create machine:', this.apiUrl, data);
    return this.http.post<Machine>(this.apiUrl, data);
  }

  update(id: string, data: UpdateMachineDto): Observable<Machine> {
    console.log('PATCH update machine:', id, data);
    return this.http.patch<Machine>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    console.log('DELETE machine:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}