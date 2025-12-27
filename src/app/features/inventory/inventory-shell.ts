import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-inventory-shell',
  imports: [RouterModule],
  template: `<router-outlet />`,
})
export class InventoryShell {}
