import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export type LotStatus = 'AVAILABLE' | 'QUARANTINE' | 'CONSUMED' | 'EXPIRED' | 'REJECTED';

export interface MaterialLot {
  id: string;
  lotNumber: string;
  materialCode: string;
  materialName: string;
  supplierCode: string;
  supplierLot: string;
  receivedDate: string;
  expiryDate: string;
  initialQty: number;
  availableQty: number;
  uom: string;
  locationCode: string;
  status: LotStatus;
  notes: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateMaterialLotDto {
  lotNumber: string;
  materialCode: string;
  materialName?: string;
  supplierCode?: string;
  supplierLot?: string;
  receivedDate?: string;
  expiryDate?: string;
  initialQty?: number;
  availableQty?: number;
  uom?: string;
  locationCode?: string;
  status?: LotStatus;
  notes?: string;
}

export interface UpdateMaterialLotDto extends Partial<CreateMaterialLotDto> {}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class MaterialLotsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/material-lots`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MaterialLot[]> {
    return this.http.get<Paginated<MaterialLot>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<MaterialLot> {
    return this.http.get<MaterialLot>(`${this.url}/${id}`);
  }

  create(dto: CreateMaterialLotDto): Observable<MaterialLot> {
    return this.http.post<MaterialLot>(this.url, dto);
  }

  update(id: string, dto: UpdateMaterialLotDto): Observable<MaterialLot> {
    return this.http.patch<MaterialLot>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
