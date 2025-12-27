import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-reports-kpi-shell',
  imports: [RouterModule],
  template: `<router-outlet />`,
})
export class ReportsKpiShell {}
