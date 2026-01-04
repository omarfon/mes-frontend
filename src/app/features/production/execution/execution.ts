import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjecucionesService, Ejecucion, EstadoEjecucion, CreateEjecucionDto } from './execution.service';
import { OrdenesService } from '../orders/orders.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environmets/environments';

@Component({
  standalone: true,
  selector: 'app-execution',
  imports: [CommonModule, FormsModule],
  templateUrl: './execution.html',
})
export class ExecutionComponent implements OnInit {
  form = {
    ordenId: '',
    maquinaId: '',
    operadorId: '',
    estado: EstadoEjecucion.INICIADA,
    fechaInicio: '',
    parametros: '{}', // JSON string para el formulario
    observaciones: '',
  };

  items: Ejecucion[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  // Listas para los selects
  ordenes: any[] = [];
  maquinas: any[] = [];
  operadores: any[] = [];

  // Exponer enums para el template
  estados = Object.values(EstadoEjecucion);

  constructor(
    private ejecucionesService: EjecucionesService,
    private ordenesService: OrdenesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEjecuciones();
    this.loadOrdenes();
    this.loadMaquinas();
    this.loadOperadores();
  }

  loadOrdenes() {
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        this.ordenes = data || [];
      },
      error: (err) => console.error('Error cargando órdenes:', err)
    });
  }

  loadMaquinas() {
    this.http.get<any>(`${environment.apiUrl}/master-data/machines`).subscribe({
      next: (response) => {
        console.log('✅ Máquinas cargadas:', response);
        this.maquinas = response.data || response || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando máquinas:', err);
        this.maquinas = [];
      }
    });
  }

  loadOperadores() {
    this.http.get<any>(`${environment.apiUrl}/operadores`).subscribe({
      next: (response) => {
        console.log('✅ Operadores cargados:', response);
        this.operadores = response.data || response || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando operadores:', err);
        this.operadores = [];
      }
    });
  }

  loadEjecuciones() {
    this.loading = true;
    this.error = null;
    
    this.ejecucionesService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Ejecuciones loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading ejecuciones:', err);
        this.error = 'No se pudieron cargar las ejecuciones.';
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
      [x.ordenId, x.maquinaId, x.operadorId, x.estado, x.observaciones]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.ordenId || !this.form.maquinaId || !this.form.operadorId) {
      this.error = 'Orden, máquina y operador son requeridos';
      return;
    }

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.form.operadorId)) {
      this.error = 'El ID de operador debe ser un UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)';
      return;
    }

    // Parsear parametros JSON
    let parametrosObj: any = null;
    try {
      if (this.form.parametros && this.form.parametros.trim()) {
        parametrosObj = JSON.parse(this.form.parametros);
      }
    } catch (e) {
      this.error = 'Parámetros debe ser un JSON válido. Ejemplo: {"temperatura":180,"velocidad":50}';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: any = {
      ordenId: this.form.ordenId,
      maquinaId: this.form.maquinaId,
      operadorId: this.form.operadorId,
    };

    // Agregar campos opcionales solo si tienen valor
    if (this.form.estado) dto.estado = this.form.estado;
    if (this.form.fechaInicio) dto.fechaInicio = this.form.fechaInicio;
    if (parametrosObj && Object.keys(parametrosObj).length > 0) dto.parametros = parametrosObj;
    if (this.form.observaciones) dto.observaciones = this.form.observaciones;

    console.log('📤 Enviando ejecución:', JSON.stringify(dto, null, 2));

    if (this.editingId) {
      this.ejecucionesService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Ejecucion updated:', updated);
          this.q = '';
          this.loadEjecuciones();
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
      this.ejecucionesService.create(dto).subscribe({
        next: (created) => {
          console.log('Ejecucion created:', created);
          this.q = '';
          this.loadEjecuciones();
          this.resetForm();
        },
        error: (err) => {
          console.error('❌ Error creating:', err);
          console.error('📋 Error details:', err.error);
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
      case 404:
        return 'Orden no encontrada.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: Ejecucion) {
    this.editingId = item.id;
    this.form = {
      ordenId: item.ordenId,
      maquinaId: item.maquinaId,
      operadorId: item.operadorId,
      estado: item.estado,
      fechaInicio: item.fechaInicio,
      parametros: item.parametros ? JSON.stringify(item.parametros, null, 2) : '{}',
      observaciones: item.observaciones || '',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta ejecución?')) return;

    this.loading = true;
    this.ejecucionesService.delete(id).subscribe({
      next: () => {
        console.log('Ejecucion deleted');
        this.loadEjecuciones();
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.error = this.extractErrorMessage(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      ordenId: '',
      maquinaId: '',
      operadorId: '',
      estado: EstadoEjecucion.INICIADA,
      fechaInicio: '',
      parametros: '{}',
      observaciones: '',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  badgeClass(estado: EstadoEjecucion) {
    switch (estado) {
      case EstadoEjecucion.INICIADA: return 'ui-badge-warn';
      case EstadoEjecucion.EN_PROCESO: return 'ui-badge';
      case EstadoEjecucion.FINALIZADA: return 'ui-badge-ok';
      case EstadoEjecucion.CANCELADA: return 'ui-badge-bad';
      case EstadoEjecucion.PAUSADA: return 'ui-badge-warn';
      default: return 'ui-badge';
    }
  }

  getOrdenInfo(ordenId: string): string {
    const orden = this.ordenes.find(o => o.id === ordenId);
    return orden ? `${orden.numeroOrden}` : ordenId.slice(0, 8) + '...';
  }

  getMaquinaInfo(maquinaId: string): string {
    const maquina = this.maquinas.find(m => m.id === maquinaId);
    return maquina ? `${maquina.code || maquina.codigo} - ${maquina.name || maquina.nombre}` : maquinaId.slice(0, 8) + '...';
  }

  getOperadorInfo(operadorId: string): string {
    const operador = this.operadores.find(o => o.id === operadorId);
    if (operador) {
      const nombre = operador.nombre || operador.name;
      const codigo = operador.codigo || operador.code;
      return `${nombre} (${codigo})`;
    }
    return operadorId.slice(0, 8) + '...';
  }
}

