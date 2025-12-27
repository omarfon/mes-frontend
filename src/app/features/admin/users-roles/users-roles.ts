import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLogin?: string;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

interface Permission {
  module: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

@Component({
  standalone: true,
  selector: 'app-users-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: './users-roles.html',
})
export class UsersRolesComponent {
  activeTab: 'USERS' | 'ROLES' = 'USERS';

  users: User[] = [
    { id: 1, username: 'admin', email: 'admin@mes.com', fullName: 'Administrador Sistema', roleId: 1, roleName: 'Administrador', status: 'ACTIVE', lastLogin: '2024-12-27 08:30', createdAt: '2024-01-01' },
    { id: 2, username: 'jperez', email: 'jperez@mes.com', fullName: 'Juan Pérez', roleId: 2, roleName: 'Supervisor', status: 'ACTIVE', lastLogin: '2024-12-26 16:45', createdAt: '2024-03-15' },
    { id: 3, username: 'mgarcia', email: 'mgarcia@mes.com', fullName: 'María García', roleId: 3, roleName: 'Operador', status: 'ACTIVE', lastLogin: '2024-12-26 14:20', createdAt: '2024-05-10' },
    { id: 4, username: 'clopez', email: 'clopez@mes.com', fullName: 'Carlos López', roleId: 2, roleName: 'Supervisor', status: 'INACTIVE', createdAt: '2024-08-22' },
  ];

  roles: Role[] = [
    { id: 1, name: 'Administrador', description: 'Acceso completo al sistema', permissions: ['ALL'], usersCount: 1 },
    { id: 2, name: 'Supervisor', description: 'Gestión de producción y reportes', permissions: ['PRODUCTION_VIEW', 'PRODUCTION_EDIT', 'QUALITY_VIEW', 'REPORTS_VIEW'], usersCount: 2 },
    { id: 3, name: 'Operador', description: 'Operación básica de producción', permissions: ['PRODUCTION_VIEW', 'PRODUCTION_CREATE'], usersCount: 1 },
    { id: 4, name: 'Calidad', description: 'Gestión de calidad y defectos', permissions: ['QUALITY_VIEW', 'QUALITY_EDIT', 'QUALITY_CREATE'], usersCount: 0 },
  ];

  modules = ['Producción', 'Calidad', 'Mantenimiento', 'Inventarios', 'Trazabilidad', 'Reportes'];

  selectedUser: User | null = null;
  selectedRole: Role | null = null;
  editingPermissions = false;
  
  rolePermissions: Permission[] = [];

  userForm: Partial<User> = { status: 'ACTIVE' };
  roleForm: Partial<Role> = {};
  editingUserId: number | null = null;
  editingRoleId: number | null = null;

  q = '';
  filterStatus = 'ALL';

  get filteredUsers() {
    let result = this.users;
    if (this.q) {
      const lower = this.q.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(lower) || 
        u.email.toLowerCase().includes(lower) || 
        u.fullName.toLowerCase().includes(lower)
      );
    }
    if (this.filterStatus !== 'ALL') {
      result = result.filter(u => u.status === this.filterStatus);
    }
    return result;
  }

  selectUser(user: User) {
    this.selectedUser = user;
  }

  editUser(user: User) {
    this.userForm = { ...user };
    this.editingUserId = user.id;
  }

  saveUser() {
    if (this.editingUserId) {
      const index = this.users.findIndex(u => u.id === this.editingUserId);
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...this.userForm } as User;
      }
    } else {
      const newUser: User = {
        id: Math.max(...this.users.map(u => u.id)) + 1,
        username: this.userForm.username!,
        email: this.userForm.email!,
        fullName: this.userForm.fullName!,
        roleId: this.userForm.roleId!,
        roleName: this.roles.find(r => r.id === this.userForm.roleId)?.name || '',
        status: this.userForm.status!,
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.users.push(newUser);
    }
    this.cancelUserEdit();
  }

  cancelUserEdit() {
    this.userForm = { status: 'ACTIVE' };
    this.editingUserId = null;
  }

  deleteUser(id: number) {
    if (confirm('¿Eliminar este usuario?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  selectRole(role: Role) {
    this.selectedRole = role;
    this.initRolePermissions(role);
  }

  initRolePermissions(role: Role) {
    this.rolePermissions = this.modules.map(module => ({
      module,
      permissions: {
        view: role.permissions.includes('ALL') || role.permissions.includes(`${module.toUpperCase()}_VIEW`),
        create: role.permissions.includes('ALL') || role.permissions.includes(`${module.toUpperCase()}_CREATE`),
        edit: role.permissions.includes('ALL') || role.permissions.includes(`${module.toUpperCase()}_EDIT`),
        delete: role.permissions.includes('ALL') || role.permissions.includes(`${module.toUpperCase()}_DELETE`),
      }
    }));
  }

  saveRole() {
    if (this.editingRoleId) {
      const index = this.roles.findIndex(r => r.id === this.editingRoleId);
      if (index !== -1) {
        this.roles[index] = { ...this.roles[index], ...this.roleForm } as Role;
      }
    }
    this.cancelRoleEdit();
  }

  cancelRoleEdit() {
    this.roleForm = {};
    this.editingRoleId = null;
  }

  getStatusBadge(status: string) {
    const badges: Record<string, string> = {
      ACTIVE: 'ui-badge-ok',
      INACTIVE: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20',
      LOCKED: 'ui-badge-bad',
    };
    return badges[status] || 'ui-badge';
  }
}
