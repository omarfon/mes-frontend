import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityStoreService } from '../services/quality-store.service';
import { Defect, CreateDefectDto, UpdateDefectDto, DefectFamily, Severity } from '../../../shared/models/quality.model';
import { Observable, combineLatest, map, BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-defects',
  imports: [CommonModule, FormsModule],
  templateUrl: './defects.html',
})
export class DefectsComponent {
  q = '';
  editing: Defect | null = null;
  loading = false;
  error: string | null = null;

  form: Partial<CreateDefectDto> = {
    code: '',
    name: '',
    familyId: '',
    severityId: '',
    description: '',
  };

  // Observables reactivos
  defects$!: Observable<Defect[]>;
  families$!: Observable<DefectFamily[]>;
  severities$!: Observable<Severity[]>;

  // Observable para el listado filtrado
  list$!: Observable<Defect[]>;
  
  // BehaviorSubjects para reactividad
  private searchQuery$ = new BehaviorSubject<string>('');
  private currentPage$ = new BehaviorSubject<number>(0);
  
  pageSize = 10;
  currentPage = 0; // Para el template

  constructor(public qs: QualityStoreService) {
    this.defects$ = this.qs.defects$;
    this.families$ = this.qs.families$;
    this.severities$ = this.qs.severities$;
    
    // Observable reactivo que responde a cambios en búsqueda y paginación
    this.list$ = combineLatest([
      this.defects$, 
      this.families$, 
      this.severities$,
      this.searchQuery$,
      this.currentPage$
    ]).pipe(
      map(([defects, families, severities, query, page]) => {
        const t = query.trim().toLowerCase();
        const filtered = defects.filter(d => {
          const fam = families.find(f => f.id === d.familyId)?.name ?? '-';
          const sev = severities.find(s => s.id === d.severityId)?.name ?? '-';
          if (!t) return true;
          return [d.code, d.name, fam, sev, d.description ?? ''].join(' ').toLowerCase().includes(t);
        });
        
        // Implementar paginación
        return filtered.slice(page * this.pageSize, (page + 1) * this.pageSize);
      })
    );
  }

  famName(id: string): string {
    return this.qs.familyName(id);
  }

  sevName(id: string): string {
    return this.qs.severityName(id);
  }

  filterList() {
    // Resetear a la primera página cuando se filtra
    this.currentPage = 0;
    this.currentPage$.next(0);
    this.searchQuery$.next(this.q);
  }

  new() {
    this.editing = null;
    this.error = null;
    this.form = {
      code: '',
      name: '',
      familyId: this.qs.families[0]?.id ?? '',
      severityId: this.qs.severities[0]?.id ?? '',
      description: '',
      isActive: true,
    };
  }

  edit(d: Defect) {
    this.editing = d;
    this.error = null;
    this.form = {
      code: d.code,
      name: d.name,
      familyId: d.familyId,
      severityId: d.severityId,
      description: d.description,
      status: d.status,
      productId: d.productId,
      productionOrderId: d.productionOrderId,
      inspectionId: d.inspectionId,
      quantity: d.quantity,
      notes: d.notes,
      isActive: d.isActive,
    };
  }

  save() {
    if (!this.form.code || !this.form.name || !this.form.familyId || !this.form.severityId) {
      this.error = 'Por favor complete los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    if (!this.editing) {
      const dto: CreateDefectDto = {
        code: this.form.code!,
        name: this.form.name!,
        familyId: this.form.familyId!,
        severityId: this.form.severityId!,
        description: this.form.description,
        status: this.form.status,
        productId: this.form.productId,
        productionOrderId: this.form.productionOrderId,
        inspectionId: this.form.inspectionId,
        quantity: this.form.quantity,
        notes: this.form.notes,
        isActive: this.form.isActive,
      };

      this.qs.createDefect(dto).subscribe({
        next: () => {
          this.loading = false;
          this.new();
          console.log('✅ Defecto creado y lista actualizada');
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al crear defecto';
          console.error('❌ Error creando defecto:', err);
        }
      });
    } else {
      const dto: UpdateDefectDto = {
        code: this.form.code,
        name: this.form.name,
        familyId: this.form.familyId,
        severityId: this.form.severityId,
        description: this.form.description,
        status: this.form.status,
        productId: this.form.productId,
        productionOrderId: this.form.productionOrderId,
        inspectionId: this.form.inspectionId,
        quantity: this.form.quantity,
        notes: this.form.notes,
        isActive: this.form.isActive,
      };

      this.qs.updateDefect(this.editing.id, dto).subscribe({
        next: () => {
          this.loading = false;
          this.new();
          console.log('✅ Defecto actualizado');
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al actualizar defecto';
          console.error('❌ Error actualizando defecto:', err);
        }
      });
    }
  }

  delete(d: Defect) {
    if (!confirm(`¿Eliminar defecto ${d.code} - ${d.name}?`)) return;
    this.loading = true;
    this.error = null;

    this.qs.deleteDefect(d.id).subscribe({
      next: () => {
        this.loading = false;
        console.log('✅ Defecto eliminado');
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al eliminar defecto';
        console.error('❌ Error eliminando defecto:', err);
      }
    });
  }

  // Métodos de paginación
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.currentPage$.next(this.currentPage);
    }
  }

  nextPage() {
    this.currentPage++;
    this.currentPage$.next(this.currentPage);
  }
}
