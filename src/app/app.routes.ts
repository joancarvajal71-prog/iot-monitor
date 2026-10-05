import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'graficas',
    loadComponent: () => import('./components/graficas/graficas').then(m => m.Graficas)
  },
  {
    path: 'alertas',
    loadComponent: () => import('./components/alertas/alertas').then(m => m.Alertas)
  },
  {
    path: 'historial',
    loadComponent: () => import('./components/historial/historial').then(m => m.Historial)
  },
  { path: '**', redirectTo: '' }
];