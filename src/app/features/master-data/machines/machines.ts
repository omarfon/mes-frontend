import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachinesService, Machine, MachineStatus, CreateMachineDto, MachineType } from './machines.service';

@Component({
  standalone: true,
  selector: 'app-machines',
  imports: [CommonModule, FormsModule],
  templateUrl: './machines.html',
})
export class MachinesComponent implements OnInit {

  formTab: 'general' | 'production' | 'maintenance' = 'general';

  machineTypes: { value: string; label: string }[] = [
    { value: 'CNC', label: 'CNC' },
    { value: 'INJECTION', label: 'Inyección' },
    { value: 'EXTRUSION', label: 'Extrusión' },
    { value: 'PRESS', label: 'Prensa' },
    { value: 'LATHE', label: 'Torno' },
    { value: 'WEAVING', label: 'Tejeduría' },
    { value: 'KNITTING', label: 'Tejido de punto' },
    { value: 'DYEING', label: 'Tintorería' },
    { value: 'CUTTING', label: 'Corte' },
    { value: 'SEWING', label: 'Confección / Costura' },
    { value: 'PACKAGING', label: 'Empaque' },
    { value: 'FILLING', label: 'Llenado / Envasado' },
    { value: 'LABELING', label: 'Etiquetado' },
    { value: 'MIXING', label: 'Mezclado' },
    { value: 'OVEN', label: 'Horno' },
    { value: 'CONVEYOR', label: 'Transportador' },
    { value: 'ROBOT', label: 'Robot' },
    { value: 'WELDING', label: 'Soldadura' },
    { value: 'ASSEMBLY', label: 'Ensamble' },
    { value: 'TESTING', label: 'Pruebas / Testing' },
    { value: 'PRINTING', label: 'Impresión' },
    { value: 'DRYING', label: 'Secado' },
    { value: 'COOLING', label: 'Enfriamiento' },
    { value: 'COMPRESSOR', label: 'Compresor' },
    { value: 'PUMP', label: 'Bomba' },
    { value: 'OTHER', label: 'Otro' },
  ];

  form: any = this.emptyForm();

  items: Machine[] = [];
  editingId: string | null = null;
  q = '';
  filterArea = '';
  loading = false;
  error: string | null = null;

  constructor(
    private machinesService: MachinesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMachines();
  }

  emptyForm() {
    return {
      code: '', name: '', description: '',
      type: '', model: '', brand: '', serialNumber: '', year: null as number | null,
      area: '', location: '', workCenter: '',
      // Producción
      nominalCapacity: null as number | null, capacityUnit: '',
      cycleTimeSec: null as number | null, setupTimeMin: null as number | null,
      powerKw: null as number | null, voltageV: null as number | null,
      // Mantenimiento
      maintenanceIntervalHours: null as number | null,
      maintenanceIntervalDays: null as number | null,
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      maintenanceCostPerHour: null as number | null,
      operatingCostPerHour: null as number | null,
      avgDowntimeMin: null as number | null,
      mtbfHours: null as number | null,
      mttrMin: null as number | null,
      // Flags
      isCritical: false, requiresCalibration: false,
      status: 'ACTIVE' as MachineStatus,
    };
  }

  loadMachines() {
    this.loading = true;
    this.error = null;
    this.machinesService.getAll().subscribe({
      next: (data) => {
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar las máquinas del servidor.';
        this.loading = false;
        this.items = [];
        this.cdr.detectChanges();
      }
    });
  }

  get areas(): string[] {
    const set = new Set<string>();
    (this.items || []).forEach(x => { if (x.area) set.add(x.area); });
    return Array.from(set).sort();
  }

  get filtered() {
    let list = this.items || [];
    if (this.filterArea) list = list.filter(x => x.area === this.filterArea);
    const t = this.q.trim().toLowerCase();
    if (t) {
      list = list.filter(x =>
        [x.code, x.name, x.description, x.type, x.area, x.location, x.model, x.brand, x.workCenter, x.status]
          .some(v => String(v || '').toLowerCase().includes(t))
      );
    }
    return list;
  }

  submit() {
    if (!this.form.code || !this.form.name) {
      this.error = 'Código y nombre son requeridos';
      return;
    }
    this.loading = true;
    this.error = null;

    const dto: any = {};
    // Solo enviar campos con valor
    Object.keys(this.form).forEach(k => {
      const v = (this.form as any)[k];
      if (v !== '' && v !== null && v !== undefined) dto[k] = v;
    });

    if (this.editingId) {
      this.machinesService.update(this.editingId, dto).subscribe({
        next: () => { this.loadMachines(); this.cancelEdit(); },
        error: (err) => {
          this.error = 'Error al actualizar: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
    } else {
      this.machinesService.create(dto).subscribe({
        next: () => { this.loadMachines(); this.resetForm(); },
        error: (err) => {
          this.error = 'Error al crear: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
    }
  }

  edit(item: Machine) {
    this.editingId = item.id;
    this.formTab = 'general';
    this.form = {
      code: item.code, name: item.name, description: item.description || '',
      type: item.type || '', model: item.model || '', brand: item.brand || '',
      serialNumber: item.serialNumber || '', year: item.year ?? null,
      area: item.area || '', location: item.location || '', workCenter: item.workCenter || '',
      nominalCapacity: item.nominalCapacity ?? null, capacityUnit: item.capacityUnit || '',
      cycleTimeSec: item.cycleTimeSec ?? null, setupTimeMin: item.setupTimeMin ?? null,
      powerKw: item.powerKw ?? null, voltageV: item.voltageV ?? null,
      maintenanceIntervalHours: item.maintenanceIntervalHours ?? null,
      maintenanceIntervalDays: item.maintenanceIntervalDays ?? null,
      lastMaintenanceDate: item.lastMaintenanceDate ? item.lastMaintenanceDate.substring(0, 10) : '',
      nextMaintenanceDate: item.nextMaintenanceDate ? item.nextMaintenanceDate.substring(0, 10) : '',
      maintenanceCostPerHour: item.maintenanceCostPerHour ?? null,
      operatingCostPerHour: item.operatingCostPerHour ?? null,
      avgDowntimeMin: item.avgDowntimeMin ?? null,
      mtbfHours: item.mtbfHours ?? null, mttrMin: item.mttrMin ?? null,
      isCritical: item.isCritical ?? false, requiresCalibration: item.requiresCalibration ?? false,
      status: item.status,
    };
  }

  remove(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta máquina?')) return;
    this.loading = true;
    this.error = null;
    this.machinesService.delete(id).subscribe({
      next: () => { this.loadMachines(); if (this.editingId === id) this.cancelEdit(); },
      error: (err) => {
        this.error = 'Error al eliminar: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() { this.form = this.emptyForm(); this.formTab = 'general'; this.error = null; }

  typeLabel(val: string | null | undefined): string {
    if (!val) return '-';
    const found = this.machineTypes.find(t => t.value === val);
    return found ? found.label : val;
  }
}