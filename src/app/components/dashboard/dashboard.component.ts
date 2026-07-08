import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { VeiculoService } from '../../services/veiculo.service';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { OrdemServico } from '../../models/ordem-servico.model';
import { Observable, combineLatest, map, tap } from 'rxjs';

interface DashboardStats {
  totalClientes: number;
  totalVeiculos: number;
  totalOrdens: number;
  ordensPendentes: number;
  ordensEmAndamento: number;
  ordensConcluidas: number;
  receitaTotal: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard animate-fade-in-up" *ngIf="stats$ | async as stats">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Dashboard</h1>
          <p>Visão geral da sua oficina</p>
        </div>
        <div class="header-date">
          <span class="material-icons-round">calendar_today</span>
          <span>{{ today | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" id="stat-clientes">
          <div class="stat-icon clientes">
            <span class="material-icons-round">people</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalClientes }}</span>
            <span class="stat-label">Clientes</span>
          </div>
          <a routerLink="/clientes" class="stat-link">
            <span class="material-icons-round">arrow_forward</span>
          </a>
        </div>

        <div class="stat-card" id="stat-veiculos">
          <div class="stat-icon veiculos">
            <span class="material-icons-round">directions_car</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalVeiculos }}</span>
            <span class="stat-label">Veículos</span>
          </div>
          <a routerLink="/veiculos" class="stat-link">
            <span class="material-icons-round">arrow_forward</span>
          </a>
        </div>

        <div class="stat-card" id="stat-ordens">
          <div class="stat-icon ordens">
            <span class="material-icons-round">assignment</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalOrdens }}</span>
            <span class="stat-label">Ordens de Serviço</span>
          </div>
          <a routerLink="/ordens-servico" class="stat-link">
            <span class="material-icons-round">arrow_forward</span>
          </a>
        </div>

        <div class="stat-card" id="stat-receita">
          <div class="stat-icon receita">
            <span class="material-icons-round">payments</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">R$ {{ stats.receitaTotal | number:'1.2-2' }}</span>
            <span class="stat-label">Receita (Concluídas)</span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Status Overview -->
        <div class="card status-card">
          <h3>
            <span class="material-icons-round">pie_chart</span>
            Status das Ordens
          </h3>
          <div class="status-bars">
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="badge badge-pending">Pendentes</span>
                <span class="status-count">{{ stats.ordensPendentes }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill pending"
                     [style.width.%]="stats.totalOrdens ? (stats.ordensPendentes / stats.totalOrdens * 100) : 0">
                </div>
              </div>
            </div>
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="badge badge-in-progress">Em Andamento</span>
                <span class="status-count">{{ stats.ordensEmAndamento }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill in-progress"
                     [style.width.%]="stats.totalOrdens ? (stats.ordensEmAndamento / stats.totalOrdens * 100) : 0">
                </div>
              </div>
            </div>
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="badge badge-completed">Concluídas</span>
                <span class="status-count">{{ stats.ordensConcluidas }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill completed"
                     [style.width.%]="stats.totalOrdens ? (stats.ordensConcluidas / stats.totalOrdens * 100) : 0">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card recent-orders-card">
          <h3>
            <span class="material-icons-round">history</span>
            Ordens Recentes
          </h3>
          <div class="recent-list" *ngIf="recentOrdens$ | async as ordens">
            <div class="recent-item" *ngFor="let ordem of ordens">
              <div class="recent-item-icon">
                <span class="material-icons-round">{{ getStatusIcon(ordem.status) }}</span>
              </div>
              <div class="recent-item-info">
                <span class="recent-item-title">OS #{{ ordem.id }} - {{ ordem.clienteNome }}</span>
                <span class="recent-item-subtitle">{{ ordem.veiculoInfo }}</span>
              </div>
              <span class="badge" [ngClass]="getStatusBadgeClass(ordem.status)">
                {{ getStatusLabel(ordem.status) }}
              </span>
            </div>
            <div class="empty-state" *ngIf="ordens.length === 0">
              <span class="material-icons-round">inbox</span>
              <p>Nenhuma ordem registrada</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card quick-actions-card">
        <h3>
          <span class="material-icons-round">flash_on</span>
          Ações Rápidas
        </h3>
        <div class="quick-actions-grid">
          <a routerLink="/clientes" [queryParams]="{action: 'new'}" class="quick-action" id="quick-new-cliente">
            <span class="material-icons-round">person_add</span>
            <span>Novo Cliente</span>
          </a>
          <a routerLink="/veiculos" [queryParams]="{action: 'new'}" class="quick-action" id="quick-new-veiculo">
            <span class="material-icons-round">add_circle</span>
            <span>Novo Veículo</span>
          </a>
          <a routerLink="/ordens-servico" [queryParams]="{action: 'new'}" class="quick-action" id="quick-new-ordem">
            <span class="material-icons-round">note_add</span>
            <span>Nova Ordem</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: var(--spacing-xl);
    }

    .header-date {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
      padding: 8px 16px;
      background: var(--bg-input);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);

      .material-icons-round { font-size: 18px; color: var(--accent-primary); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .stat-card {
      background: var(--gradient-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all var(--transition-normal);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        opacity: 0.05;
        transform: translate(30%, -30%);
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-glow);
        border-color: var(--border-color-hover);
      }
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      min-width: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons-round { font-size: 26px; color: #fff; }

      &.clientes { background: linear-gradient(135deg, #6c63ff, #8b83ff); }
      &.veiculos { background: linear-gradient(135deg, #00d2ff, #00b4d8); }
      &.ordens { background: linear-gradient(135deg, #ffab40, #ff9100); }
      &.receita { background: linear-gradient(135deg, #00e676, #00c853); }
    }

    .stat-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }
    }

    .stat-link {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: var(--bg-input);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all var(--transition-fast);

      .material-icons-round { font-size: 18px; }

      &:hover {
        background: rgba(108, 99, 255, 0.2);
        color: var(--accent-primary);
      }
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .card h3 {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      font-size: 1rem;

      .material-icons-round {
        font-size: 20px;
        color: var(--accent-primary);
      }
    }

    /* Status Bars */
    .status-bars {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .status-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-xs);
    }

    .status-count {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .progress-track {
      height: 8px;
      background: var(--bg-input);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 4px;

      &.pending { background: linear-gradient(90deg, #ffab40, #ff9100); }
      &.in-progress { background: linear-gradient(90deg, #40c4ff, #00b0ff); }
      &.completed { background: linear-gradient(90deg, #00e676, #00c853); }
    }

    /* Recent Orders */
    .recent-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }
    }

    .recent-item-icon {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: var(--radius-sm);
      background: var(--bg-input);
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons-round {
        font-size: 18px;
        color: var(--text-secondary);
      }
    }

    .recent-item-info {
      flex: 1;
      min-width: 0;

      .recent-item-title {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .recent-item-subtitle {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    /* Quick Actions */
    .quick-actions-card {
      &:hover {
        transform: none;
      }
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--spacing-md);
    }

    .quick-action {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-normal);

      .material-icons-round {
        font-size: 24px;
        color: var(--accent-primary);
      }

      span:last-child {
        font-weight: 600;
        font-size: 0.9rem;
      }

      &:hover {
        background: rgba(108, 99, 255, 0.1);
        border-color: var(--border-color-hover);
        color: var(--text-primary);
        transform: translateY(-2px);
      }
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  stats$!: Observable<DashboardStats>;
  recentOrdens$!: Observable<OrdemServico[]>;

  constructor(
    private clienteService: ClienteService,
    private veiculoService: VeiculoService,
    private ordemServicoService: OrdemServicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stats$ = combineLatest([
      this.clienteService.getTotal(),
      this.veiculoService.getTotal(),
      this.ordemServicoService.getOrdens(),
      this.ordemServicoService.getReceitaTotal()
    ]).pipe(
      map(([totalClientes, totalVeiculos, ordens, receitaTotal]) => ({
        totalClientes,
        totalVeiculos,
        totalOrdens: ordens.length,
        ordensPendentes: ordens.filter(o => o.status === 'pendente').length,
        ordensEmAndamento: ordens.filter(o => o.status === 'em_andamento').length,
        ordensConcluidas: ordens.filter(o => o.status === 'concluida').length,
        receitaTotal
      })),
      tap(() => this.cdr.detectChanges())
    );

    this.recentOrdens$ = this.ordemServicoService.getOrdens().pipe(
      map(ordens => [...ordens].sort((a, b) =>
        new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime()
      ).slice(0, 5)),
      tap(() => this.cdr.detectChanges())
    );
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pendente': 'schedule',
      'em_andamento': 'autorenew',
      'concluida': 'check_circle',
      'cancelada': 'cancel'
    };
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'pendente': 'badge-pending',
      'em_andamento': 'badge-in-progress',
      'concluida': 'badge-completed',
      'cancelada': 'badge-cancelled'
    };
    return classes[status] || '';
  }
}
