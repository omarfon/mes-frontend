import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-feasibility-shell',
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
})
export class FeasibilityShellComponent {}
