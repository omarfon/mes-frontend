import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QualityStoreService } from '../services/quality-store.service';
import { Defect, DefectFamily, Severity, InspectionType, InspectionResult } from '../../../shared/models/quality.model';
import { Observable, combineLatest, map, startWith } from 'rxjs';

interface DashboardStats {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  passRate: number;
  totalDefects: number;
  criticalDefects: number;
  defectRate: number;
}

interface InspectionsByType {
  type: string;
  count: number;
  percentage: number;
}

interface DefectsByFamily {
  family: string;
  count: number;
  percentage: number;
  severity: string;
}

interface TopDefect {
  name: string;
  count: number;
  severity: string;
}

interface RecentInspection {
  id: string;
  date: Date;
  type: string;
  status: string;
  node: string;
  defectsCount: number;
}

@Component({
  selector: 'app-quality-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private qualityStore = inject(QualityStoreService);

  // Filtros
  selectedPeriod = signal('today');
  startDate = signal(new Date(new Date().setDate(new Date().getDate() - 30)));
  endDate = signal(new Date());

  // Observables principales
  inspections$ = this.qualityStore.inspections$;
  defects$ = this.qualityStore.defects$;
  families$ = this.qualityStore.families$;
  severities$ = this.qualityStore.severities$;

  // Estadísticas generales
  stats$: Observable<DashboardStats>;
  
  // Inspecciones por tipo
  inspectionsByType$: Observable<InspectionsByType[]>;
  
  // Defectos por familia
  defectsByFamily$: Observable<DefectsByFamily[]>;
  
  // Top 5 defectos
  topDefects$: Observable<TopDefect[]>;
  
  // Inspecciones recientes
  recentInspections$: Observable<RecentInspection[]>;

  constructor() {
    // Calcular estadísticas generales
    this.stats$ = combineLatest([
      this.inspections$,
      this.defects$,
      this.severities$
    ]).pipe(
      map(([inspections, defects, severities]) => {
        const filtered = this.filterByDateRange(inspections);
        const total = filtered.length;
        const passed = filtered.filter(i => i.status === InspectionResult.PASSED).length;
        const failed = filtered.filter(i => i.status === InspectionResult.FAILED).length;
        const pending = filtered.filter(i => i.status === InspectionResult.PENDING).length;
        const passRate = total > 0 ? (passed / total) * 100 : 0;

        // Contar defectos de las inspecciones filtradas
        const inspectionIds = filtered.map(i => i.id);
        const relatedDefects = defects.filter(d => 
          d.inspectionId && inspectionIds.includes(d.inspectionId)
        );
        
        const totalDefects = relatedDefects.length;
        
        // Contar defectos críticos
        const criticalSeverities = severities
          .filter(s => s.name.toLowerCase().includes('crítico') || s.name.toLowerCase().includes('critical'))
          .map(s => s.id);
        
        const criticalDefects = relatedDefects.filter(d => 
          d.severityId && criticalSeverities.includes(d.severityId)
        ).length;

        const defectRate = total > 0 ? (totalDefects / total) : 0;

        return {
          totalInspections: total,
          passedInspections: passed,
          failedInspections: failed,
          pendingInspections: pending,
          passRate,
          totalDefects,
          criticalDefects,
          defectRate
        };
      })
    );

    // Calcular inspecciones por tipo
    this.inspectionsByType$ = this.inspections$.pipe(
      map(inspections => {
        const filtered = this.filterByDateRange(inspections);
        const total = filtered.length;
        
        const byType = new Map<InspectionType, number>();
        filtered.forEach(i => {
          const current = byType.get(i.type) || 0;
          byType.set(i.type, current + 1);
        });

        return Array.from(byType.entries()).map(([type, count]) => ({
          type: this.getTypeLabel(type),
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }));
      })
    );

    // Calcular defectos por familia
    this.defectsByFamily$ = combineLatest([
      this.defects$,
      this.families$,
      this.severities$,
      this.inspections$
    ]).pipe(
      map(([defects, families, severities, inspections]) => {
        const filteredInspections = this.filterByDateRange(inspections);
        const inspectionIds = filteredInspections.map(i => i.id);
        
        const relatedDefects = defects.filter(d => 
          d.inspectionId && inspectionIds.includes(d.inspectionId)
        );

        const total = relatedDefects.length;
        
        const byFamily = new Map<string, { count: number; severityId?: string }>();
        relatedDefects.forEach(d => {
          const familyId = d.familyId || 'sin-familia';
          const current = byFamily.get(familyId) || { count: 0 };
          byFamily.set(familyId, { 
            count: current.count + 1, 
            severityId: d.severityId || current.severityId 
          });
        });

        return Array.from(byFamily.entries()).map(([familyId, data]) => {
          const family = families.find(f => f.id === familyId);
          const severity = data.severityId 
            ? severities.find(s => s.id === data.severityId) 
            : null;

          return {
            family: family?.name || 'Sin familia',
            count: data.count,
            percentage: total > 0 ? (data.count / total) * 100 : 0,
            severity: severity?.name || 'No especificado'
          };
        }).sort((a, b) => b.count - a.count);
      })
    );

    // Top 5 defectos más frecuentes
    this.topDefects$ = combineLatest([
      this.defects$,
      this.severities$,
      this.inspections$
    ]).pipe(
      map(([defects, severities, inspections]) => {
        const filteredInspections = this.filterByDateRange(inspections);
        const inspectionIds = filteredInspections.map(i => i.id);
        
        const relatedDefects = defects.filter(d => 
          d.inspectionId && inspectionIds.includes(d.inspectionId)
        );

        // Contar por nombre de defecto
        const defectCounts = new Map<string, { count: number; severityId?: string }>();
        relatedDefects.forEach(d => {
          const current = defectCounts.get(d.name) || { count: 0 };
          defectCounts.set(d.name, { 
            count: current.count + 1, 
            severityId: d.severityId || current.severityId 
          });
        });

        return Array.from(defectCounts.entries())
          .map(([name, data]) => {
            const severity = data.severityId 
              ? severities.find(s => s.id === data.severityId) 
              : null;

            return {
              name,
              count: data.count,
              severity: severity?.name || 'No especificado'
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      })
    );

    // Inspecciones recientes (últimas 10)
    this.recentInspections$ = this.inspections$.pipe(
      map(inspections => {
        const filtered = this.filterByDateRange(inspections);
        
        return filtered
          .sort((a, b) => {
            const dateA = a.inspectionDate ? new Date(a.inspectionDate).getTime() : 0;
            const dateB = b.inspectionDate ? new Date(b.inspectionDate).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10)
          .map(i => ({
            id: i.id,
            date: i.inspectionDate ? new Date(i.inspectionDate) : new Date(),
            type: this.getTypeLabel(i.type),
            status: this.getStatusLabel(i.status),
            node: i.node?.code || i.nodeId || 'N/A',
            defectsCount: i.defects?.length || 0
          }));
      })
    );
  }

  ngOnInit() {
    this.qualityStore.loadInspections();
    this.qualityStore.loadDefects();
    this.qualityStore.loadFamilies();
    this.qualityStore.loadSeverities();
  }

  private filterByDateRange(inspections: any[]): any[] {
    const start = this.startDate();
    const end = this.endDate();
    
    return inspections.filter(i => {
      if (!i.inspectionDate) return false;
      const inspDate = new Date(i.inspectionDate);
      return inspDate >= start && inspDate <= end;
    });
  }

  onPeriodChange(period: string) {
    this.selectedPeriod.set(period);
    const now = new Date();
    const end = new Date();
    
    switch (period) {
      case 'today':
        end.setHours(23, 59, 59, 999);
        this.startDate.set(new Date(now.setHours(0, 0, 0, 0)));
        this.endDate.set(end);
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        this.startDate.set(weekStart);
        this.endDate.set(end);
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        this.startDate.set(monthStart);
        this.endDate.set(end);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        this.startDate.set(quarterStart);
        this.endDate.set(end);
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        this.startDate.set(yearStart);
        this.endDate.set(end);
        break;
    }

    // Recargar datos
    this.qualityStore.loadInspections();
    this.qualityStore.loadDefects();
  }

  private getTypeLabel(type: InspectionType): string {
    const labels: Record<InspectionType, string> = {
      [InspectionType.RAW_MATERIAL]: 'Materia Prima',
      [InspectionType.IN_PROCESS]: 'En Proceso',
      [InspectionType.FINISHED_GOOD]: 'Producto Terminado'
    };
    return labels[type] || type;
  }

  private getStatusLabel(status: InspectionResult): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'PASSED': 'Aprobado',
      'FAILED': 'Rechazado',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  }

  navigateToInspections() {
    this.router.navigate(['/quality/inspections']);
  }

  navigateToDefects() {
    this.router.navigate(['/quality/defects']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPercent(value: number): string {
    return value.toFixed(1) + '%';
  }
}
