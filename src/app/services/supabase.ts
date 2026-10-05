import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwgobzhthnxzsccatdxp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z29iemh0aG54enNjY2F0ZHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMzA0NjQsImV4cCI6MjEwNjYwNjQ2NH0.RR3ZTTc2dL_aoy36Tt2m9zZGGo5QVFBVGoVaXZ7UlIM';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  getClient() { return this.supabase; }

  async getLecturas(limite = 50) {
    return this.supabase
      .from('lecturas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limite);
  }

  async getUltimaLectura() {
    return this.supabase
      .from('lecturas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  async getAlertas() {
    return this.supabase
      .from('alertas')
      .select('*')
      .eq('resuelta', false)
      .order('created_at', { ascending: false })
      .limit(20);
  }

  async getUmbrales() {
    return this.supabase.from('umbrales').select('*');
  }

  async insertarLectura(lectura: any) {
    return this.supabase.from('lecturas').insert([lectura]);
  }

  async crearAlerta(alerta: any) {
    return this.supabase.from('alertas').insert([alerta]);
  }

  async marcarAlertaResuelta(id: string) {
    return this.supabase.from('alertas').update({ resuelta: true }).eq('id', id);
  }

  suscribirLecturas(callback: (lectura: any) => void) {
    return this.supabase
      .channel('lecturas-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lecturas' },
        (payload: any) => callback(payload.new))
      .subscribe();
  }

  suscribirAlertas(callback: (alerta: any) => void) {
    return this.supabase
      .channel('alertas-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alertas' },
        (payload: any) => callback(payload.new))
      .subscribe();
  }
}