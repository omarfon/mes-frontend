import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-shell',
  imports: [RouterModule],
  template: `<router-outlet />`,
})
export class AdminShell {}
