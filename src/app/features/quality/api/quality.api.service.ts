// src/app/features/quality/api/quality.api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

import {
  Defect,
  CreateDefectDto,
  UpdateDefectDto,
  DefectFamily,
  CreateDefectFamilyDto,
  UpdateDefectFamilyDto,
  Severity,
  CreateSeverityDto,
  UpdateSeverityDto,
  DefectFilters,
  Inspection,
  CreateInspectionDto,
  UpdateInspectionDto
} from '../../../shared/models/quality.model';
import { environment } from '../../../../environmets/environments';

@Injectable({
  providedIn: 'root'
})
export class QualityApiService {
  getDefectsByFamily() {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/quality`;

  // ===== DEFECTS =====
  
  getDefects(filters?: DefectFilters): Observable<Defect[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.familyId) params = params.set('familyId', filters.familyId);
      if (filters.severityId) params = params.set('severityId', filters.severityId);
      if (filters.productId) params = params.set('productId', filters.productId);
      if (filters.productionOrderId) params = params.set('productionOrderId', filters.productionOrderId);
      if (filters.inspectionId) params = params.set('inspectionId', filters.inspectionId);
      if (filters.isActive !== undefined) params = params.set('isActive', String(filters.isActive));
      if (filters.search) params = params.set('search', filters.search);
    }
    
    // Agregar logs para depuración
    console.log('🔄 Enviando solicitud GET a:', `${this.baseUrl}/defects`);
    return this.http.get<Defect[]>(`${this.baseUrl}/defects`, { params }).pipe(
      tap(response => {
        console.log('📦 Respuesta del backend:', response);
      }),
      catchError(err => {
        console.error('❌ Error en la solicitud GET:', err);
        return throwError(() => err);
      })
    );
  }

  getDefectById(id: string): Observable<Defect> {
    return this.http.get<Defect>(`${this.baseUrl}/defects/${id}`);
  }

  createDefect(dto: CreateDefectDto): Observable<Defect> {
    return this.http.post<Defect>(`${this.baseUrl}/defects`, dto);
  }

  updateDefect(id: string, dto: UpdateDefectDto): Observable<Defect> {
    return this.http.patch<Defect>(`${this.baseUrl}/defects/${id}`, dto);
  }

  deleteDefect(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/defects/${id}`);
  }

  // ===== DEFECT FAMILIES =====
  
  getDefectFamilies(): Observable<DefectFamily[]> {
    return this.http.get<DefectFamily[]>(`${this.baseUrl}/defect-families`);
  }

  getDefectFamilyById(id: string): Observable<DefectFamily> {
    return this.http.get<DefectFamily>(`${this.baseUrl}/defect-families/${id}`);
  }

  createDefectFamily(dto: CreateDefectFamilyDto): Observable<DefectFamily> {
    return this.http.post<DefectFamily>(`${this.baseUrl}/defect-families`, dto);
  }

  updateDefectFamily(id: string, dto: UpdateDefectFamilyDto): Observable<DefectFamily> {
    return this.http.patch<DefectFamily>(`${this.baseUrl}/defect-families/${id}`, dto);
  }

  deleteDefectFamily(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/defect-families/${id}`);
  }

  // ===== SEVERITIES =====
  
  getSeverities(): Observable<Severity[]> {
    return this.http.get<Severity[]>(`${this.baseUrl}/severities`);
  }

  getSeverityById(id: string): Observable<Severity> {
    return this.http.get<Severity>(`${this.baseUrl}/severities/${id}`);
  }

  createSeverity(dto: CreateSeverityDto): Observable<Severity> {
    return this.http.post<Severity>(`${this.baseUrl}/severities`, dto);
  }

  updateSeverity(id: string, dto: UpdateSeverityDto): Observable<Severity> {
    return this.http.patch<Severity>(`${this.baseUrl}/severities/${id}`, dto);
  }

  deleteSeverity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/severities/${id}`);
  }

  // ===== INSPECTIONS =====
  
  getInspections(): Observable<Inspection[]> {
    return this.http.get<Inspection[]>(`${this.baseUrl}/inspections`);
  }

  getInspectionById(id: string): Observable<Inspection> {
    return this.http.get<Inspection>(`${this.baseUrl}/inspections/${id}`);
  }

  createInspection(dto: CreateInspectionDto): Observable<Inspection> {
    return this.http.post<Inspection>(`${this.baseUrl}/inspections`, dto);
  }

  updateInspection(id: string, dto: UpdateInspectionDto): Observable<Inspection> {
    return this.http.patch<Inspection>(`${this.baseUrl}/inspections/${id}`, dto);
  }

  deleteInspection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inspections/${id}`);
  }
}