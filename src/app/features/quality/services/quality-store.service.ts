import { Injectable, inject } from '@angular/core';
import { QualityApiService } from '../api/quality.api.service';
import { 
  Defect, 
  DefectFamily, 
  Severity, 
  CreateDefectDto,
  UpdateDefectDto,
  DefectStatus,
  SeverityLevel,
  Inspection,
  CreateInspectionDto,
  UpdateInspectionDto
} from '../../../shared/models/quality.model';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';

export interface DefectsByFamilyStats {
  familyId: string;
  familyName: string;
  count: number;
}

export interface DefectsBySeverityStats {
  severityId: string;
  severityName: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class QualityStoreService {
  private api = inject(QualityApiService);
  
  // BehaviorSubjects para estado reactivo
  private defectsSubject = new BehaviorSubject<Defect[]>([]);
  private familiesSubject = new BehaviorSubject<DefectFamily[]>([]);
  private severitiesSubject = new BehaviorSubject<Severity[]>([]);
  private inspectionsSubject = new BehaviorSubject<Inspection[]>([]);
  
  // Observables públicos
  defects$ = this.defectsSubject.asObservable();
  families$ = this.familiesSubject.asObservable();
  severities$ = this.severitiesSubject.asObservable();
  inspections$ = this.inspectionsSubject.asObservable();
  
  // Getters para acceso síncrono (compatibilidad con código existente)
  get defects(): Defect[] { return this.defectsSubject.value; }
  get families(): DefectFamily[] { return this.familiesSubject.value; }
  get severities(): Severity[] { return this.severitiesSubject.value; }
  get inspections() { return this.inspectionsSubject.value; }

  // Estadísticas
  private defectsByFamilySubject = new BehaviorSubject<DefectsByFamilyStats[]>([]);
  private defectsBySeveritySubject = new BehaviorSubject<DefectsBySeverityStats[]>([]);

  // Observables públicos para estadísticas
  defectsByFamily$ = this.defectsByFamilySubject.asObservable();
  defectsBySeverity$ = this.defectsBySeveritySubject.asObservable();

  // Getters para estadísticas
  get defectsByFamilyStats(): DefectsByFamilyStats[] { return this.defectsByFamilySubject.value; }
  get defectsBySeverityStats(): DefectsBySeverityStats[] { return this.defectsBySeveritySubject.value; }

  constructor() {
    console.log('🚀 QualityStoreService iniciado');
    
    // Cargar datos desde backend - NO usar mock como fallback
    this.loadDefects().subscribe({
      next: (data) => {
        console.log('✅ Defectos cargados desde BD:', data.length);
      },
      error: (err) => {
        console.warn('⚠️ No se pudieron cargar defectos desde BD:', err.message);
        // NO llamar a useMockDefects() - dejar array vacío
      }
    });
    
    this.loadFamilies().subscribe({
      next: (data) => {
        console.log('✅ Familias cargadas desde BD:', data.length);
      },
      error: (err) => {
        console.warn('⚠️ No se pudieron cargar familias desde BD:', err.message);
        // NO llamar a useMockFamilies() - dejar array vacío
      }
    });
    
    this.loadSeverities().subscribe({
      next: (data) => {
        console.log('✅ Severidades cargadas desde BD:', data.length);
      },
      error: (err) => {
        console.warn('⚠️ No se pudieron cargar severidades desde BD:', err.message);
        // NO llamar a useMockSeverities() - dejar array vacío
      }
    });
    
    this.loadDefectsByFamily().subscribe({
      next: (data) => console.log('✅ Estadísticas por familia:', data.length),
      error: () => {}
    });

    this.loadDefectsBySeverity().subscribe({
      next: (data) => console.log('✅ Estadísticas por severidad:', data.length),
      error: () => {}
    });
    
    this.loadInspections().subscribe({
      next: (data) => {
        console.log('✅ Inspecciones cargadas desde BD:', data.length);
      },
      error: (err: any) => {
        console.warn('⚠️ No se pudieron cargar inspecciones desde BD:', err.message);
      }
    });
    
    console.log('🏁 Constructor finalizado');
  }

  // ===== CARGA DE DATOS =====
  
  loadAllData(): void {
    this.loadDefects().subscribe();
    this.loadFamilies().subscribe();
    this.loadSeverities().subscribe();
    this.loadDefectsByFamily().subscribe();
    this.loadDefectsBySeverity().subscribe();
    this.loadInspections().subscribe();
  }

  loadDefects(): Observable<Defect[]> {
    console.log('🔄 Intentando cargar defectos desde backend...');
    // Agregar logs para depuración
    console.log('🔍 DefectsSubject actual:', this.defectsSubject.value);
    return this.api.getDefects().pipe(
      tap(defects => {
        console.log('✅ Defectos cargados desde backend:', defects.length);
        this.defectsSubject.next(defects);
        console.log('🔍 DefectsSubject actualizado:', this.defectsSubject.value);
      }),
      catchError(err => {
        console.error('❌ Error cargando defectos desde backend:', err);
        console.error('   Status:', err.status);
        console.error('   URL:', err.url);
        return throwError(() => err);
      })
    );
  }

  loadFamilies(): Observable<DefectFamily[]> {
    console.log('🔄 Intentando cargar familias desde backend...');
    return this.api.getDefectFamilies().pipe(
      tap(response => {
        console.log('📦 Respuesta RAW de familias:', response);
        console.log('📦 Tipo de respuesta:', typeof response);
        console.log('📦 Es array?:', Array.isArray(response));
        
        // Verificar si la respuesta tiene estructura {data: []}
        const families = (response as any)?.data || response;
        console.log('✅ Familias procesadas:', families.length);
        this.familiesSubject.next(families);
      }),
      catchError(err => {
        console.error('❌ Error cargando familias desde backend:', err);
        return throwError(() => err);
      })
    );
  }

  loadSeverities(): Observable<Severity[]> {
    console.log('🔄 Intentando cargar severidades desde backend...');
    return this.api.getSeverities().pipe(
      tap(response => {
        console.log('📦 Respuesta RAW de severidades:', response);
        console.log('📦 Tipo de respuesta:', typeof response);
        console.log('📦 Es array?:', Array.isArray(response));
        
        // Verificar si la respuesta tiene estructura {data: []}
        const severities = (response as any)?.data || response;
        console.log('✅ Severidades procesadas:', severities.length);
        this.severitiesSubject.next(severities);
      }),
      catchError(err => {
        console.error('❌ Error cargando severidades desde backend:', err);
        return throwError(() => err);
      })
    );
  }

  loadDefectsByFamily(): Observable<DefectsByFamilyStats[]> {
    // TODO: Implement getDefectsByFamily in API service
    console.warn('⚠️ getDefectsByFamily no implementado en API');
    return of([]).pipe(
      tap(stats => this.defectsByFamilySubject.next(stats)),
      catchError(err => throwError(() => err))
    );
  }

  loadDefectsBySeverity(): Observable<DefectsBySeverityStats[]> {
    // TODO: Implement getDefectsBySeverity in API service
    console.warn('⚠️ getDefectsBySeverity no implementado en API');
    return of([]).pipe(
      tap(stats => this.defectsBySeveritySubject.next(stats)),
      catchError(err => throwError(() => err))
    );
  }

  loadInspections(): Observable<Inspection[]> {
    console.log('🔄 Intentando cargar inspecciones desde backend...');
    return this.api.getInspections().pipe(
      tap(response => {
        console.log('📦 Respuesta RAW de inspecciones:', response);
        console.log('📦 Tipo de respuesta:', typeof response);
        console.log('📦 Es array?:', Array.isArray(response));
        
        // Verificar si la respuesta tiene estructura {data: []} o es array directo
        const inspections = (response as any)?.data || response || [];
        console.log('✅ Inspecciones procesadas:', inspections.length);
        this.inspectionsSubject.next(inspections);
      }),
      catchError((err: any) => {
        console.error('❌ Error cargando inspecciones:', err);
        return throwError(() => err);
      })
    );
  }

  // ===== OPERACIONES CRUD DEFECTS =====
  
  createDefect(dto: CreateDefectDto): Observable<Defect> {
    // Validar que los campos requeridos estén presentes
    if (!dto.familyId || !dto.severityId) {
      console.error('❌ familyId o severityId faltante:', { familyId: dto.familyId, severityId: dto.severityId });
      return throwError(() => new Error('familyId y severityId son requeridos'));
    }

    const backendDto: any = {
      code: dto.code,
      name: dto.name,
      familyId: dto.familyId,
      severityId: dto.severityId,
    };
    
    // Solo agregar campos opcionales si tienen valor
    if (dto.description) backendDto.description = dto.description;
    if (dto.status) backendDto.status = dto.status;
    if (dto.productId) backendDto.productId = dto.productId;
    if (dto.productionOrderId) backendDto.productionOrderId = dto.productionOrderId;
    if (dto.inspectionId) backendDto.inspectionId = dto.inspectionId;
    if (dto.quantity !== undefined) backendDto.quantity = dto.quantity;
    if (dto.notes) backendDto.notes = dto.notes;
    
    console.log('📤 DTO enviado al backend:', backendDto);
    
    return this.api.createDefect(backendDto).pipe(
      tap(newDefect => console.log('✅ Defecto creado:', newDefect)),
      // Recargar la lista completa después de crear
      tap(() => {
        this.loadDefects().subscribe();
      })
    );
  }

  updateDefect(id: string, dto: UpdateDefectDto): Observable<Defect> {
    return this.api.updateDefect(id, dto).pipe(
      tap(updatedDefect => {
        const current = this.defectsSubject.value;
        const index = current.findIndex(d => d.id === id);
        if (index !== -1) {
          const updated = [...current];
          updated[index] = updatedDefect;
          this.defectsSubject.next(updated);
        }
      })
      // NO hay catchError con fallback
    );
  }

  deleteDefect(id: string): Observable<void> {
    return this.api.deleteDefect(id).pipe(
      tap(() => {
        const current = this.defectsSubject.value;
        this.defectsSubject.next(current.filter(d => d.id !== id));
      })
      // NO hay catchError con fallback
    );
  }

  // ===== OPERACIONES CRUD INSPECTIONS =====
  
  createInspection(dto: CreateInspectionDto): Observable<Inspection> {
    // Mapear DTO del frontend al formato esperado por el backend
    const backendDto: any = {
      type: dto.type,
      // Preferir `nodeId` si viene desde el formulario, si no, intentar usar lotId/productionOrderId/productId
      nodeId: (dto as any).nodeId || dto.lotId || dto.productionOrderId || dto.productId || '',
    };

    // Mapear estado/resultados
    if ((dto as any).status) backendDto.status = (dto as any).status;
    if (dto.result) backendDto.status = dto.result;

    // Cantidad inspeccionada
    if ((dto as any).inspectedQuantity !== undefined) backendDto.inspectedQuantity = (dto as any).inspectedQuantity;
    if (dto.quantityInspected !== undefined) backendDto.inspectedQuantity = dto.quantityInspected;

    // Notas
    if ((dto as any).notes) backendDto.notes = (dto as any).notes;
    if (dto.observations) backendDto.notes = dto.observations;

    console.log('📤 Enviando DTO de inspección al backend (mapeado):', backendDto);

    return this.api.createInspection(backendDto).pipe(
      tap((inspection: Inspection) => {
        const current = this.inspectionsSubject.value;
        this.inspectionsSubject.next([...current, inspection]);
        console.log('✅ Inspección creada:', inspection);
      })
    );
  }

  updateInspection(id: string, dto: UpdateInspectionDto): Observable<Inspection> {
    return this.api.updateInspection(id, dto).pipe(
      tap((updated: Inspection) => {
        const current = this.inspectionsSubject.value;
        const idx = current.findIndex(i => i.id === id);
        if (idx !== -1) {
          current[idx] = updated;
          this.inspectionsSubject.next([...current]);
          console.log('✅ Inspección actualizada:', updated);
        }
      })
    );
  }

  deleteInspection(id: string): Observable<void> {
    return this.api.deleteInspection(id).pipe(
      tap(() => {
        const current = this.inspectionsSubject.value;
        this.inspectionsSubject.next(current.filter(i => i.id !== id));
        console.log('✅ Inspección eliminada:', id);
      })
    );
  }

  // ===== HELPERS =====
  
  familyName(id: string): string {
    return this.families.find(f => f.id === id)?.name ?? '-';
  }

  severityName(id: string): string {
    return this.severities.find(s => s.id === id)?.name ?? '-';
  }

  defectById(id: string): Defect | null {
    return this.defects.find(d => d.id === id) ?? null;
  }

  severityById(id: string): Severity | null {
    return this.severities.find(s => s.id === id) ?? null;
  }

  newId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID?.() ?? String(Date.now())}`;
  }
}
export type { Defect, DefectFamily, Severity, SeverityLevel };


