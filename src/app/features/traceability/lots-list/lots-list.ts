import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-lots-list',
  imports: [CommonModule],
  templateUrl: './lots-list.html',
})
export class LotsListComponent implements OnInit {
  lots = [
    { code: 'L-001', status: 'En proceso', origin: 'Hilatura', currentLocation: 'Línea 1' },
    { code: 'L-002', status: 'Terminado', origin: 'Cardado', currentLocation: 'Almacén' },
  ];

  ngOnInit(): void {}
}
