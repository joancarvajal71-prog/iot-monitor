import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  lecturas: any[] = [];
  cargando = true;
  pagina = 0;
  porPagina = 20;
  filtroSensor = 'todos';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    this.cargando = true;
    const { data } = await this.supabase.getLecturas(100);
    if (data) this.lecturas = data;
    this.cargando = false;
  }

  get lecturasPaginadas() {
    const inicio = this.pagina * this.porPagina;
    return this.lecturas.slice(inicio, inicio + this.porPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.lecturas.length / this.porPagina);
  }

  anterior() {
    if (this.pagina > 0) this.pagina--;
  }

  siguiente() {
    if (this.pagina < this.totalPaginas - 1) this.pagina++;
  }

  async exportarExcel() {
    const { utils, writeFile } = await import('xlsx');
    const datos = this.lecturas.map(l => ({
      'Fecha': l.created_at,
      'Temperatura °C': l.temperatura,
      'Humedad %': l.humedad,
      'Presión hPa': l.presion,
      'Altitud m': l.altitud,
      'Voltaje V': l.voltaje,
      'Luz lux': l.luz,
      'Dispositivo': l.dispositivo,
    }));
    const hoja = utils.json_to_sheet(datos);
    const libro = utils.book_new();
    utils.book_append_sheet(libro, hoja, 'Historial');
    writeFile(libro, `Historial_IoT_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}