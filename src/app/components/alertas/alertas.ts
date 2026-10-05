import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class Alertas implements OnInit {
  alertas: any[] = [];
  cargando = true;
  filtro = 'todas';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.cargarAlertas();
  }

  async cargarAlertas() {
    this.cargando = true;
    const { data } = await this.supabase.getClient()
      .from('alertas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) this.alertas = data;
    this.cargando = false;
  }

  get alertasFiltradas() {
    if (this.filtro === 'pendientes') return this.alertas.filter(a => !a.resuelta);
    if (this.filtro === 'resueltas') return this.alertas.filter(a => a.resuelta);
    return this.alertas;
  }

  async resolver(id: string) {
    await this.supabase.marcarAlertaResuelta(id);
    this.alertas = this.alertas.map((a: any) =>
      a.id === id ? { ...a, resuelta: true } : a
    );
  }

  get totalPendientes() {
    return this.alertas.filter(a => !a.resuelta).length;
  }

  get totalResueltas() {
    return this.alertas.filter(a => a.resuelta).length;
  }
}