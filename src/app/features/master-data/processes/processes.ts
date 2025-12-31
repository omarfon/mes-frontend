import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessesService, Proceso, TipoProceso, EstadoProceso, CreateProcesoDto } from './processes.service';

@Component({
  standalone: true,
  selector: 'app-processes',
  imports: [CommonModule, FormsModule],
  templateUrl: './processes.html',
})
export class ProcessesComponent implements OnInit {
  form = {
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: TipoProceso.MANUFACTURA,
    estado: EstadoProceso.ACTIVO,
    version: '1.0',
    tiempoEstandarMinutos: 0,
    tiempoSetupMinutos: 0,
    instrucciones: '',
    requisitosCalidad: '',
    secuencia: 1,
    eficienciaEsperada: 85,
    costoEstandar: 0,
    notas: '',
  };

  items: Proceso[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  // Exponer enums para el template
  tipos = Object.values(TipoProceso);
  estados = Object.values(EstadoProceso);

  constructor(
    private processesService: ProcessesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProcesses();
  }

  loadProcesses() {
    this.loading = true;
    this.error = null;
    
    this.processesService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Processes loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading processes:', err);
        this.error = 'No se pudieron cargar los procesos.';
        this.loading = false;
        this.items = [];
        this.cdr.detectChanges();
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.codigo, x.nombre, x.descripcion, x.tipo, x.estado]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.codigo || !this.form.nombre) {
      this.error = 'Código y nombre son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateProcesoDto = {
      codigo: this.form.codigo,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion || undefined,
      tipo: this.form.tipo,
      estado: this.form.estado || undefined,
      version: this.form.version || undefined,
      tiempoEstandarMinutos: this.form.tiempoEstandarMinutos || undefined,
      tiempoSetupMinutos: this.form.tiempoSetupMinutos || undefined,
      instrucciones: this.form.instrucciones || undefined,
      requisitosCalidad: this.form.requisitosCalidad || undefined,
      secuencia: this.form.secuencia || undefined,
      eficienciaEsperada: this.form.eficienciaEsperada || undefined,
      costoEstandar: this.form.costoEstandar || undefined,
      notas: this.form.notas || undefined,
    };

    if (this.editingId) {
      this.processesService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Process updated:', updated);
          this.q = ''; // Limpiar filtro
          this.loadProcesses();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.processesService.create(dto).subscribe({
        next: (created) => {
          console.log('Process created:', created);
          this.q = ''; // Limpiar filtro
          this.loadProcesses();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private extractErrorMessage(err: any): string {
    if (typeof err.error?.message === 'string') {
      return err.error.message;
    }
    
    if (Array.isArray(err.error?.message)) {
      return err.error.message.join(', ');
    }
    
    if (err.error?.error) {
      return err.error.error;
    }
    
    switch (err.status) {
      case 400:
        return 'Datos inválidos. Verifica el formulario.';
      case 409:
        return 'Ya existe un proceso con este código.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(it: Proceso) {
    this.editingId = it.id;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      descripcion: it.descripcion || '',
      tipo: it.tipo,
      estado: it.estado || EstadoProceso.ACTIVO,
      version: it.version || '1.0',
      tiempoEstandarMinutos: it.tiempoEstandarMinutos || 0,
      tiempoSetupMinutos: it.tiempoSetupMinutos || 0,
      instrucciones: it.instrucciones || '',
      requisitosCalidad: it.requisitosCalidad || '',
      secuencia: it.secuencia || 1,
      eficienciaEsperada: it.eficienciaEsperada || 85,
      costoEstandar: it.costoEstandar || 0,
      notas: it.notas || '',
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(id: string) {
    if (!confirm('¿Estás seguro de eliminar este proceso?')) return;

    this.loading = true;
    this.error = null;

    this.processesService.delete(id).subscribe({
      next: () => {
        console.log('Process deleted');
        this.loadProcesses();
        if (this.editingId === id) this.cancelEdit();
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.error = this.extractErrorMessage(err);
        this.loading = false;
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: TipoProceso.MANUFACTURA,
      estado: EstadoProceso.ACTIVO,
      version: '1.0',
      tiempoEstandarMinutos: 0,
      tiempoSetupMinutos: 0,
      instrucciones: '',
      requisitosCalidad: '',
      secuencia: 1,
      eficienciaEsperada: 85,
      costoEstandar: 0,
      notas: '',
    };
    this.error = null;
  }
}
