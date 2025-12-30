import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachinesService, Machine, MachineStatus, CreateMachineDto } from './machines.service';

@Component({
  standalone: true,
  selector: 'app-machines',
  imports: [CommonModule, FormsModule],
  templateUrl: './machines.html',
})
export class MachinesComponent implements OnInit {
  form = {
    code: '',
    name: '',
    description: '',
    type: '',
    status: 'ACTIVE' as MachineStatus,
  };

  items: Machine[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(
    private machinesService: MachinesService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('MachinesComponent initialized');
  }

  ngOnInit() {
    console.log('MachinesComponent ngOnInit - loading machines');
    this.loadMachines();
  }

  loadMachines() {
    console.log('>>> loadMachines() called');
    this.loading = true;
    this.error = null;
    
    this.machinesService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Machines loaded successfully from backend');
        console.log('   - Number of machines:', data?.length);
        
        this.items = data || [];
        this.loading = false;
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        console.log('   - this.items after assignment:', this.items);
        console.log('   - this.items.length:', this.items.length);
      },
      error: (err) => {
        console.error('❌ Error loading machines:', err);
        this.error = 'No se pudieron cargar las máquinas del servidor.';
        this.loading = false;
        this.items = [];
        this.cdr.detectChanges();
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) {
      return this.items || [];
    }
    
    return (this.items || []).filter(x =>
      [x.code, x.name, x.description, x.type, x.area, x.location, x.status]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

 submit() {
    console.log('Submit clicked. Form data:', this.form);
    
    if (!this.form.code || !this.form.name) {
      console.warn('Form validation failed');
      this.error = 'Código y nombre son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    // Solo enviar los campos que el backend acepta
    const dto: CreateMachineDto = {
      code: this.form.code,
      name: this.form.name,
      status: this.form.status,
      description: this.form.description || undefined,
      // NO enviar type - el backend lo rechaza
    };

    if (this.editingId) {
      console.log('Updating machine:', this.editingId);
      this.machinesService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Machine updated successfully:', updated);
          this.loadMachines();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating machine:', err);
          this.error = 'Error al actualizar: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
    } else {
      console.log('Creating new machine with DTO:', dto);
      this.machinesService.create(dto).subscribe({
        next: (newMachine) => {
          console.log('Machine created successfully:', newMachine);
          this.loadMachines();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating machine:', err);
          this.error = 'Error al crear: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
    }
  }

  edit(item: Machine) {
    this.editingId = item.id;
    this.form = { 
      code: item.code, 
      name: item.name, 
      description: item.description || '',
      type: item.type || '',
      status: item.status 
    };
  }

  remove(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta máquina?')) return;

    this.loading = true;
    this.error = null;

    this.machinesService.delete(id).subscribe({
      next: () => {
        console.log('Machine deleted successfully');
        this.loadMachines();
        if (this.editingId === id) this.cancelEdit();
      },
      error: (err) => {
        console.error('Error deleting machine:', err);
        this.error = 'Error al eliminar: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = { code: '', name: '', description: '', type: '', status: 'ACTIVE' };
    this.error = null;
  }
}