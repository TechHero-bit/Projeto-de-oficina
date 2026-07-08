import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { VeiculosComponent } from './components/veiculos/veiculos.component';
import { OrdensServicoComponent } from './components/ordens-servico/ordens-servico.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'veiculos', component: VeiculosComponent },
  { path: 'ordens-servico', component: OrdensServicoComponent },
  { path: '**', redirectTo: '/login' }
];
