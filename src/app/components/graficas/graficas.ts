import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-graficas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graficas.html',
  styleUrl: './graficas.css'
})
export class Graficas implements OnInit {
  lecturas: any[] = [];
  cargando = true;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.getLecturas(20);
    if (data) this.lecturas = data.reverse();
    this.cargando = false;
  }

  getLabels() {
    return this.lecturas.map((l, i) => `#${i + 1}`);
  }

  getTemperaturas() {
    return this.lecturas.map(l => l.temperatura);
  }

  getHumedades() {
    return this.lecturas.map(l => l.humedad);
  }

  getVoltajes() {
    return this.lecturas.map(l => l.voltaje);
  }

  getLuces() {
    return this.lecturas.map(l => l.luz);
  }

  getMax(arr: number[]) {
    return arr.length ? Math.max(...arr) : 0;
  }

  getMin(arr: number[]) {
    return arr.length ? Math.min(...arr) : 0;
  }

  getPromedio(arr: number[]) {
    return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0;
  }

  getAltura(valor: number, max: number): string {
    return max > 0 ? `${(valor / max) * 100}%` : '0%';
  }
}