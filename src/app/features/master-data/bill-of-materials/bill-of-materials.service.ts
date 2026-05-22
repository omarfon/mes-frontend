import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface BomLine {
  id?: string;
  materialCode: string;
  materialName: string;
  qty: number;
  uom: string;
  scrapPct: number;
  phase: string;
  optional: boolean;
  notes: string;
}

export interface Bom {
  id: string;
  code: string;
  productCode: string;
  productName: string;
  version: string;
  baseQty: number;
  baseUom: string;
  validFrom: string;
  active: boolean;
  lines: BomLine[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateBomDto {
  code: string;
  productCode: string;
  productName?: string;
  version?: string;
  baseQty?: number;
  baseUom?: string;
  validFrom?: string;
  active?: boolean;
}

export interface UpdateBomDto extends Partial<CreateBomDto> {}

export interface CreateBomLineDto {
  materialCode: string;
  materialName?: string;
  qty?: number;
  uom?: string;
  scrapPct?: number;
  phase?: string;
  optional?: boolean;
  notes?: string;
}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class BillOfMaterialsService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/bill-of-materials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bom[]> {
    return this.http.get<Paginated<Bom>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<Bom> {
    return this.http.get<Bom>(`${this.url}/${id}`);
  }

  create(dto: CreateBomDto): Observable<Bom> {
    return this.http.post<Bom>(this.url, dto);
  }

  update(id: string, dto: UpdateBomDto): Observable<Bom> {
    return this.http.patch<Bom>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Sub-resource: lines
  getLines(bomId: string): Observable<BomLine[]> {
    return this.http.get<BomLine[]>(`${this.url}/${bomId}/lines`);
  }

  addLine(bomId: string, dto: CreateBomLineDto): Observable<BomLine> {
    return this.http.post<BomLine>(`${this.url}/${bomId}/lines`, dto);
  }

  updateLine(bomId: string, lineId: string, dto: Partial<CreateBomLineDto>): Observable<BomLine> {
    return this.http.patch<BomLine>(`${this.url}/${bomId}/lines/${lineId}`, dto);
  }

  deleteLine(bomId: string, lineId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${bomId}/lines/${lineId}`);
  }
}
