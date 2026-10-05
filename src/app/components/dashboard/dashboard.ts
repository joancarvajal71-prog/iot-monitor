import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  ultimaLectura: any = null;
  alertasActivas: any[] = [];
  umbrales: any[] = [];
  suscripcion: any;
  suscripcionAlertas: any;
  cargando = true;

  sensores = [
    { key: 'temperatura', label: 'Temperatura', unidad: '°C', icono: '🌡️' },
    { key: 'humedad', label: 'Humedad', unidad: '%', icono: '💧' },
    { key: 'presion', label: 'Presión', unidad: ' hPa', icono: '🌐' },
    { key: 'altitud', label: 'Altitud', unidad: ' m', icono: '📏' },
    { key: 'voltaje', label: 'Voltaje', unidad: ' V', icono: '⚡' },
    { key: 'luz', label: 'Luz', unidad: ' lux', icono: '☀️' },
  ];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.cargarDatos();
    this.iniciarRealtime();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const [lectura, alertas, umbrales] = await Promise.all([
        this.supabase.getUltimaLectura(),
        this.supabase.getAlertas(),
        this.supabase.getUmbrales(),
      ]);
      if (lectura.data) this.ultimaLectura = lectura.data;
      if (alertas.data) this.alertasActivas = alertas.data;
      if (umbrales.data) this.umbrales = umbrales.data;
    } catch(e) {
      console.error('Error:', e);
    }
    this.cargando = false;
  }

  iniciarRealtime() {
    this.suscripcion = this.supabase.suscribirLecturas((nueva: any) => {
      this.ultimaLectura = nueva;
    });
    this.suscripcionAlertas = this.supabase.suscribirAlertas((nueva: any) => {
      this.alertasActivas = [nueva, ...this.alertasActivas];
    });
  }

  getUmbral(sensor: string) {
    return this.umbrales.find((u: any) => u.sensor === sensor);
  }

  getEstado(sensor: string, valor: number): string {
    const u = this.getUmbral(sensor);
    if (!u || valor === null) return 'normal';
    return valor < u.valor_min || valor > u.valor_max ? 'alerta' : 'normal';
  }

  getValor(sensor: string): number {
    return this.ultimaLectura ? this.ultimaLectura[sensor] : 0;
  }

  async resolverAlerta(id: string) {
    await this.supabase.marcarAlertaResuelta(id);
    this.alertasActivas = this.alertasActivas.filter((a: any) => a.id !== id);
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
    this.suscripcionAlertas?.unsubscribe();
  }
}