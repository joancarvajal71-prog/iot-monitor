import {
  Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() dispositivo: string = 'ESP32-001';

  ultimaLectura: any = null;
  alertasActivas: any[] = [];
  umbrales: any[] = [];
  suscripcion: any;
  suscripcionAlertas: any;
  cargando = true;
  conectado = false;
  timer: any;
  logCiclos: string[] = [];

  sensores = [
    { key: 'temperatura', label: 'Temperatura', unidad: '°C', icono: '🌡️' },
    { key: 'humedad', label: 'Humedad', unidad: '%', icono: '💧' },
    { key: 'presion', label: 'Presión', unidad: ' hPa', icono: '🌐' },
    { key: 'altitud', label: 'Altitud', unidad: ' m', icono: '📏' },
    { key: 'voltaje', label: 'Voltaje', unidad: ' V', icono: '⚡' },
    { key: 'luz', label: 'Luz', unidad: ' lux', icono: '☀️' },
  ];

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.agregarLog('🔧 Constructor ejecutado — componente creado');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dispositivo']) {
      const anterior = changes['dispositivo'].previousValue;
      const actual = changes['dispositivo'].currentValue;
      this.agregarLog(`🔄 ngOnChanges — dispositivo cambió de "${anterior}" a "${actual}"`);
      console.log('ngOnChanges ejecutado:', changes);
    }
  }

  async ngOnInit() {
    this.agregarLog('✅ ngOnInit — componente inicializado');
    console.log('ngOnInit ejecutado');
    await this.cargarDatos();
    this.iniciarRealtime();
    this.iniciarTimer();
  }

  ngOnDestroy() {
    this.agregarLog('🗑️ ngOnDestroy — limpiando recursos...');
    console.log('ngOnDestroy ejecutado — liberando recursos');

    if (this.suscripcion) {
      this.suscripcion.unsubscribe();
      console.log('✓ Suscripcion de lecturas cancelada');
    }

    if (this.suscripcionAlertas) {
      this.suscripcionAlertas.unsubscribe();
      console.log('✓ Suscripcion de alertas cancelada');
    }

    if (this.timer) {
      clearInterval(this.timer);
      console.log('✓ Timer cancelado');
    }

    this.agregarLog('✓ ngOnDestroy — recursos liberados correctamente');
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const [lectura, alertas, umbrales] = await Promise.all([
        this.supabase.getUltimaLectura(),
        this.supabase.getAlertas(),
        this.supabase.getUmbrales(),
      ]);
      console.log('Lectura:', lectura, 'Alertas:', alertas, 'Umbrales:', umbrales);
      if (lectura.data) this.ultimaLectura = lectura.data;
      if (alertas.data) this.alertasActivas = alertas.data;
      if (umbrales.data) this.umbrales = umbrales.data;
      this.agregarLog('📡 Datos cargados desde Supabase');
    } catch (e) {
      console.error('Error:', e);
    } finally {
      this.cargando = false;
      this.actualizarConexion();
    }
  }

  iniciarRealtime() {
    this.suscripcion = this.supabase.suscribirLecturas((nueva: any) => {
      this.ultimaLectura = nueva;
      this.agregarLog(`📥 Nueva lectura recibida — Temp: ${nueva.temperatura}°C`);
      this.actualizarConexion();
    });
    this.suscripcionAlertas = this.supabase.suscribirAlertas((nueva: any) => {
      this.alertasActivas = [nueva, ...this.alertasActivas];
      this.agregarLog(`⚠️ Nueva alerta — ${nueva.sensor}: ${nueva.mensaje}`);
      this.cdr.detectChanges();
    });
    this.agregarLog('🔌 Suscripciones Realtime iniciadas');
    this.cdr.detectChanges();
  }

  iniciarTimer() {
    this.timer = setInterval(() => this.actualizarConexion(), 3000);
    this.agregarLog('⏱️ Timer iniciado — verificación de conexión cada 3 segundos');
    this.actualizarConexion();
  }

  // Considera "conectado" si la última lectura tiene menos de 15 segundos
  actualizarConexion() {
    if (!this.ultimaLectura?.created_at) {
      this.conectado = false;
    } else {
      let fecha = this.ultimaLectura.created_at as string;
      // Supabase devuelve la hora en UTC sin la "Z"; se añade para interpretarla bien
      if (!/Z|[+-]\d\d:?\d\d$/.test(fecha)) fecha += 'Z';
      const segundos = (Date.now() - new Date(fecha).getTime()) / 1000;
      this.conectado = segundos < 15;
    }
    this.cdr.detectChanges();
  }

  agregarLog(mensaje: string) {
    const hora = new Date().toLocaleTimeString('es-CO');
    this.logCiclos = [`[${hora}] ${mensaje}`, ...this.logCiclos].slice(0, 8);
    this.cdr?.markForCheck();
  }

  getUmbral(sensor: string) {
    return this.umbrales.find((u: any) => u.sensor === sensor);
  }

  getEstado(sensor: string, valor: number): string {
    const u = this.getUmbral(sensor);
    if (!u || valor === null || valor === undefined) return 'normal';
    return valor < u.valor_min || valor > u.valor_max ? 'alerta' : 'normal';
  }

  getValor(sensor: string): number {
    return this.ultimaLectura ? this.ultimaLectura[sensor] : 0;
  }

  async resolverAlerta(id: string) {
    await this.supabase.marcarAlertaResuelta(id);
    this.alertasActivas = this.alertasActivas.filter((a: any) => a.id !== id);
    this.cdr.detectChanges();
  }
}