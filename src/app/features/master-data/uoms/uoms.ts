import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UomsService, UnidadMedida, TipoUnidadMedida, CreateUnidadMedidaDto } from './uoms.service';

@Component({
  standalone: true,
  selector: 'app-uoms',
  imports: [CommonModule, FormsModule],
  templateUrl: './uoms.html',
})
export class UomsComponent implements OnInit {
  form = {
    codigo: '',
    nombre: '',
    simbolo: '',
    tipo: TipoUnidadMedida.CANTIDAD,
    descripcion: '',
    factorConversion: 1,
    esSI: false,
    activo: true,
    decimales: 2,
  };

  items: UnidadMedida[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  // Exponer enum para el template
  tipos = Object.values(TipoUnidadMedida);

  constructor(
    private uomsService: UomsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUoms();
  }

  loadUoms() {
    this.loading = true;
    this.error = null;
    
    this.uomsService.getAll().subscribe({
      next: (data) => {
        console.log('✅ UoMs loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading UoMs:', err);
        this.error = 'No se pudieron cargar las unidades de medida.';
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
      [x.codigo, x.nombre, x.simbolo, x.descripcion, x.tipo]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.codigo || !this.form.nombre || !this.form.simbolo) {
      this.error = 'Código, nombre y símbolo son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateUnidadMedidaDto = {
      codigo: this.form.codigo,
      nombre: this.form.nombre,
      simbolo: this.form.simbolo,
      tipo: this.form.tipo,
      descripcion: this.form.descripcion || undefined,
      factorConversion: this.form.factorConversion || undefined,
      esSI: this.form.esSI,
      activo: this.form.activo,
      decimales: this.form.decimales || undefined,
    };

    if (this.editingId) {
      this.uomsService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('UoM updated:', updated);
          this.loadUoms();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
        }
      });
    } else {
      this.uomsService.create(dto).subscribe({
        next: (created) => {
          console.log('UoM created:', created);
          this.loadUoms();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating:', err);
          console.error('Full error response:', err.error);
          console.error('Error status:', err.status);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
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
        return 'Ya existe una unidad con este código.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(it: UnidadMedida) {
    this.editingId = it.id;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      simbolo: it.simbolo,
      tipo: it.tipo,
      descripcion: it.descripcion || '',
      factorConversion: it.factorConversion || 1,
      esSI: it.esSI || false,
      activo: it.activo !== false,
      decimales: it.decimales || 2,
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta unidad de medida?')) return;

    this.loading = true;
    this.error = null;

    this.uomsService.delete(id).subscribe({
      next: () => {
        console.log('UoM deleted');
        this.loadUoms();
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
      simbolo: '',
      tipo: TipoUnidadMedida.CANTIDAD,
      descripcion: '',
      factorConversion: 1,
      esSI: false,
      activo: true,
      decimales: 2,
    };
    this.error = null;
  }
}
