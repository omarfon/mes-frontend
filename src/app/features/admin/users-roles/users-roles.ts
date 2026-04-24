import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type PermLevel = 'ver' | 'crear' | 'editar' | 'eliminar' | 'aprobar' | 'exportar';

export interface MesUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  failedAttempts: number;
}

export interface ModulePermissions {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  aprobar: boolean;
  exportar: boolean;
}

export interface MesRole {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: Record<string, ModulePermissions>;
  usersCount: number;
}

const ALL_ON: ModulePermissions = { ver: true, crear: true, editar: true, eliminar: true, aprobar: true, exportar: true };
const READONLY: ModulePermissions = { ver: true, crear: false, editar: false, eliminar: false, aprobar: false, exportar: false };
const VIEW_EXPORT: ModulePermissions = { ver: true, crear: false, editar: false, eliminar: false, aprobar: false, exportar: true };
const NONE: ModulePermissions = { ver: false, crear: false, editar: false, eliminar: false, aprobar: false, exportar: false };
const OPS: ModulePermissions = { ver: true, crear: true, editar: true, eliminar: false, aprobar: false, exportar: false };
const OPS_APPROVE: ModulePermissions = { ver: true, crear: true, editar: true, eliminar: false, aprobar: true, exportar: true };

@Component({
  standalone: true,
  selector: 'app-users-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: './users-roles.html',
})
export class UsersRolesComponent {
  activeTab: 'USERS' | 'ROLES' = 'USERS';
  q = '';
  filterStatus: UserStatus | 'ALL' = 'ALL';
  selectedUserId: string | null = null;
  selectedRoleId: string | null = null;
  showNewUserForm = false;
  editingUserId: string | null = null;
  showRoleForm = false;
  editingRoleId: string | null = null;
  roleFormName = '';
  roleFormDescription = '';
  roleFormColor = 'text-slate-300';
  roleFormPerms: Record<string, ModulePermissions> = {};

  readonly colorOptions = [
    { value: 'text-red-400', bg: 'bg-red-400', label: 'Rojo' },
    { value: 'text-amber-400', bg: 'bg-amber-400', label: 'Ámbar' },
    { value: 'text-emerald-400', bg: 'bg-emerald-400', label: 'Verde' },
    { value: 'text-blue-400', bg: 'bg-blue-400', label: 'Azul' },
    { value: 'text-purple-400', bg: 'bg-purple-400', label: 'Morado' },
    { value: 'text-cyan-400', bg: 'bg-cyan-400', label: 'Cian' },
    { value: 'text-pink-400', bg: 'bg-pink-400', label: 'Rosa' },
    { value: 'text-slate-400', bg: 'bg-slate-400', label: 'Gris' },
  ];

  readonly modules = ['Producción', 'Calidad', 'Mantenimiento', 'Inventario', 'Trazabilidad', 'Reportes', 'Admin', 'Integración'];
  readonly permLevels: PermLevel[] = ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'];

  roles: MesRole[] = [
    {
      id: 'rol-01', name: 'Administrador', description: 'Acceso total al sistema. Gestiona usuarios, roles y parámetros.',
      color: 'text-red-400', usersCount: 1,
      permissions: {
        'Producción': { ...ALL_ON }, 'Calidad': { ...ALL_ON }, 'Mantenimiento': { ...ALL_ON },
        'Inventario': { ...ALL_ON }, 'Trazabilidad': { ...ALL_ON }, 'Reportes': { ...ALL_ON },
        'Admin': { ...ALL_ON }, 'Integración': { ...ALL_ON },
      },
    },
    {
      id: 'rol-02', name: 'Supervisor Producción', description: 'Gestión de órdenes, asignación y seguimiento de producción.',
      color: 'text-amber-400', usersCount: 2,
      permissions: {
        'Producción': { ...ALL_ON }, 'Calidad': { ...VIEW_EXPORT }, 'Mantenimiento': { ...READONLY },
        'Inventario': { ...READONLY }, 'Trazabilidad': { ...READONLY }, 'Reportes': { ...VIEW_EXPORT },
        'Admin': { ...NONE }, 'Integración': { ...NONE },
      },
    },
    {
      id: 'rol-03', name: 'Inspector Calidad', description: 'Gestión de inspecciones, NC/CAPA, decisiones de calidad y cuarentena.',
      color: 'text-blue-400', usersCount: 2,
      permissions: {
        'Producción': { ...READONLY }, 'Calidad': { ...ALL_ON }, 'Mantenimiento': { ...NONE },
        'Inventario': { ...NONE }, 'Trazabilidad': { ...OPS_APPROVE }, 'Reportes': { ...VIEW_EXPORT },
        'Admin': { ...NONE }, 'Integración': { ...NONE },
      },
    },
    {
      id: 'rol-04', name: 'Operador Producción', description: 'Operación básica: reporte de progreso, tiempos y consumos.',
      color: 'text-emerald-400', usersCount: 3,
      permissions: {
        'Producción': { ver: true, crear: false, editar: true, eliminar: false, aprobar: false, exportar: false },
        'Calidad': { ...READONLY }, 'Mantenimiento': { ver: true, crear: true, editar: false, eliminar: false, aprobar: false, exportar: false },
        'Inventario': { ...READONLY }, 'Trazabilidad': { ...READONLY }, 'Reportes': { ...NONE },
        'Admin': { ...NONE }, 'Integración': { ...NONE },
      },
    },
    {
      id: 'rol-05', name: 'Almacenista', description: 'Gestión de inventario, movimientos, transferencias y ajustes.',
      color: 'text-purple-400', usersCount: 1,
      permissions: {
        'Producción': { ...READONLY }, 'Calidad': { ...NONE }, 'Mantenimiento': { ...NONE },
        'Inventario': { ...ALL_ON }, 'Trazabilidad': { ...READONLY }, 'Reportes': { ver: true, crear: false, editar: false, eliminar: false, aprobar: false, exportar: true },
        'Admin': { ...NONE }, 'Integración': { ...NONE },
      },
    },
    {
      id: 'rol-06', name: 'Técnico Mantenimiento', description: 'Ejecución de OTs preventivas/correctivas, historial de activos.',
      color: 'text-cyan-400', usersCount: 1,
      permissions: {
        'Producción': { ...READONLY }, 'Calidad': { ...NONE }, 'Mantenimiento': { ...ALL_ON },
        'Inventario': { ...READONLY }, 'Trazabilidad': { ...NONE }, 'Reportes': { ...READONLY },
        'Admin': { ...NONE }, 'Integración': { ...NONE },
      },
    },
    {
      id: 'rol-07', name: 'Solo Lectura', description: 'Consulta sin modificaciones. Ideal para auditores externos.',
      color: 'text-slate-400', usersCount: 0,
      permissions: {
        'Producción': { ...READONLY }, 'Calidad': { ...READONLY }, 'Mantenimiento': { ...READONLY },
        'Inventario': { ...READONLY }, 'Trazabilidad': { ...READONLY }, 'Reportes': { ...VIEW_EXPORT },
        'Admin': { ...NONE }, 'Integración': { ...NONE },
      },
    },
  ];

  users: MesUser[] = [
    { id: 'u-01', username: 'admin', email: 'admin@mes.local', fullName: 'Administrador Sistema', roleId: 'rol-01', roleName: 'Administrador', status: 'ACTIVE', lastLogin: '2026-04-19T06:02:00Z', createdAt: '2024-01-01', failedAttempts: 0 },
    { id: 'u-02', username: 'jperez', email: 'jperez@mes.local', fullName: 'Juan Pérez', roleId: 'rol-02', roleName: 'Supervisor Producción', status: 'ACTIVE', lastLogin: '2026-04-19T06:15:00Z', createdAt: '2024-03-15', failedAttempts: 0 },
    { id: 'u-03', username: 'mgarcia', email: 'mgarcia@mes.local', fullName: 'María García', roleId: 'rol-03', roleName: 'Inspector Calidad', status: 'ACTIVE', lastLogin: '2026-04-19T06:20:00Z', createdAt: '2024-05-10', failedAttempts: 0 },
    { id: 'u-04', username: 'rtorres', email: 'rtorres@mes.local', fullName: 'Roberto Torres', roleId: 'rol-06', roleName: 'Técnico Mantenimiento', status: 'ACTIVE', lastLogin: '2026-04-18T07:00:00Z', createdAt: '2024-06-01', failedAttempts: 0 },
    { id: 'u-05', username: 'clopez', email: 'clopez@mes.local', fullName: 'Carlos López', roleId: 'rol-04', roleName: 'Operador Producción', status: 'LOCKED', createdAt: '2024-08-22', failedAttempts: 5 },
    { id: 'u-06', username: 'fmorales', email: 'fmorales@mes.local', fullName: 'Felipe Morales', roleId: 'rol-05', roleName: 'Almacenista', status: 'ACTIVE', lastLogin: '2026-04-19T06:50:00Z', createdAt: '2024-09-01', failedAttempts: 0 },
    { id: 'u-07', username: 'lsanchez', email: 'lsanchez@mes.local', fullName: 'Laura Sánchez', roleId: 'rol-03', roleName: 'Inspector Calidad', status: 'ACTIVE', lastLogin: '2026-04-17T08:00:00Z', createdAt: '2026-04-17', failedAttempts: 0 },
    { id: 'u-08', username: 'rquinta', email: 'rquinta@mes.local', fullName: 'Rosa Quintana', roleId: 'rol-04', roleName: 'Operador Producción', status: 'INACTIVE', createdAt: '2024-11-15', failedAttempts: 0 },
  ];

  userForm: Partial<MesUser> = { status: 'ACTIVE' };

  get filteredUsers(): MesUser[] {
    const t = this.q.trim().toLowerCase();
    return this.users.filter(u => {
      if (this.filterStatus !== 'ALL' && u.status !== this.filterStatus) return false;
      if (t && ![u.username, u.fullName, u.email, u.roleName].join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }

  get selectedUser(): MesUser | null {
    return this.users.find(u => u.id === this.selectedUserId) ?? null;
  }

  get lockedCount(): number {
    return this.users.filter(u => u.status === 'LOCKED').length;
  }

  get selectedRole(): MesRole | null {
    return this.roles.find(r => r.id === this.selectedRoleId) ?? null;
  }

  selectUser(u: MesUser) { this.selectedUserId = u.id; this.editingUserId = null; }

  selectRole(r: MesRole) {
    this.selectedRoleId = r.id;
    this.showRoleForm = false;
    this.editingRoleId = null;
  }

  newRole() {
    this.editingRoleId = null;
    this.roleFormName = '';
    this.roleFormDescription = '';
    this.roleFormColor = 'text-slate-300';
    this.roleFormPerms = {};
    for (const mod of this.modules) {
      this.roleFormPerms[mod] = { ver: false, crear: false, editar: false, eliminar: false, aprobar: false, exportar: false };
    }
    this.showRoleForm = true;
    this.selectedRoleId = null;
  }

  editRole(r: MesRole) {
    this.editingRoleId = r.id;
    this.roleFormName = r.name;
    this.roleFormDescription = r.description;
    this.roleFormColor = r.color;
    this.roleFormPerms = {};
    for (const mod of this.modules) {
      this.roleFormPerms[mod] = { ...r.permissions[mod] };
    }
    this.showRoleForm = true;
    this.selectedRoleId = r.id;
  }

  toggleRolePerm(mod: string, perm: PermLevel) {
    this.roleFormPerms[mod][perm] = !this.roleFormPerms[mod][perm];
  }

  saveRole() {
    if (!this.roleFormName.trim()) return;
    if (this.editingRoleId) {
      const idx = this.roles.findIndex(r => r.id === this.editingRoleId);
      if (idx !== -1) {
        this.roles[idx] = {
          ...this.roles[idx],
          name: this.roleFormName,
          description: this.roleFormDescription,
          color: this.roleFormColor,
          permissions: { ...this.roleFormPerms },
        };
        // Update roleName in users that have this role
        this.users.forEach(u => {
          if (u.roleId === this.editingRoleId) u.roleName = this.roleFormName;
        });
      }
    } else {
      const newId = 'rol-' + Date.now();
      this.roles.push({
        id: newId,
        name: this.roleFormName,
        description: this.roleFormDescription,
        color: this.roleFormColor,
        permissions: { ...this.roleFormPerms },
        usersCount: 0,
      });
      this.selectedRoleId = newId;
    }
    this.showRoleForm = false;
    this.editingRoleId = null;
  }

  cancelRoleEdit() {
    this.showRoleForm = false;
    this.editingRoleId = null;
  }

  toggleLock(u: MesUser) {
    u.status = u.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    if (u.status === 'ACTIVE') u.failedAttempts = 0;
  }

  saveUser() {
    if (this.editingUserId) {
      const idx = this.users.findIndex(u => u.id === this.editingUserId);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...this.userForm } as MesUser;
        const role = this.roles.find(r => r.id === this.userForm.roleId);
        if (role) this.users[idx].roleName = role.name;
      }
    } else {
      const role = this.roles.find(r => r.id === this.userForm.roleId);
      this.users.push({
        id: 'u-' + Date.now(),
        username: this.userForm.username!,
        email: this.userForm.email!,
        fullName: this.userForm.fullName!,
        roleId: this.userForm.roleId!,
        roleName: role?.name ?? '',
        status: this.userForm.status ?? 'ACTIVE',
        createdAt: new Date().toISOString().slice(0, 10),
        failedAttempts: 0,
      });
    }
    this.editingUserId = null;
    this.showNewUserForm = false;
    this.userForm = { status: 'ACTIVE' };
  }

  editUser(u: MesUser) {
    this.userForm = { ...u };
    this.editingUserId = u.id;
    this.showNewUserForm = true;
    this.selectedUserId = u.id;
  }

  cancelEdit() {
    this.editingUserId = null;
    this.showNewUserForm = false;
    this.userForm = { status: 'ACTIVE' };
  }

  countPerms(role: MesRole): number {
    let n = 0;
    for (const m of Object.values(role.permissions)) {
      n += (Object.values(m) as boolean[]).filter(Boolean).length;
    }
    return n;
  }

  statusBadge(s: UserStatus): string {
    return {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      INACTIVE: 'bg-slate-700 text-slate-400',
      LOCKED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    }[s] ?? '';
  }

  statusLabel(s: UserStatus): string {
    return { ACTIVE: 'Activo', INACTIVE: 'Inactivo', LOCKED: 'Bloqueado' }[s] ?? s;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
