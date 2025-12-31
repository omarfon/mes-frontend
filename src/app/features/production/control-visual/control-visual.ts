import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-control-visual',
  imports: [CommonModule],
  templateUrl: './control-visual.html',
})
export class ControlVisualComponent {
  // Panel de control visual para producción en tiempo real
  // Mostrará métricas clave, estado de líneas, alertas visuales
}
