import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <span class="material-icons-round">build</span>
          </div>
          <div class="logo-text" *ngIf="!isCollapsed">
            <h1>OFIMEC</h1>
            <span>Oficina</span>
          </div>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()" id="sidebar-toggle">
          <span class="material-icons-round">
            {{ isCollapsed ? 'chevron_right' : 'chevron_left' }}
          </span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" id="nav-dashboard"
           [attr.title]="isCollapsed ? 'Dashboard' : null">
          <span class="material-icons-round">dashboard</span>
          <span class="nav-label" *ngIf="!isCollapsed">Dashboard</span>
        </a>
        <a routerLink="/clientes" routerLinkActive="active" class="nav-item" id="nav-clientes"
           [attr.title]="isCollapsed ? 'Clientes' : null">
          <span class="material-icons-round">people</span>
          <span class="nav-label" *ngIf="!isCollapsed">Clientes</span>
        </a>
        <a routerLink="/veiculos" routerLinkActive="active" class="nav-item" id="nav-veiculos"
           [attr.title]="isCollapsed ? 'Veículos' : null">
          <span class="material-icons-round">directions_car</span>
          <span class="nav-label" *ngIf="!isCollapsed">Veículos</span>
        </a>
        <a routerLink="/ordens-servico" routerLinkActive="active" class="nav-item" id="nav-ordens"
           [attr.title]="isCollapsed ? 'Ordens de Serviço' : null">
          <span class="material-icons-round">assignment</span>
          <span class="nav-label" *ngIf="!isCollapsed">Ordens de Serviço</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="version-info">
          <span class="material-icons-round">code</span>
          <span>Projeto de Estudos</span>
        </div>
        <small>Angular 17 • v1.0</small>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--gradient-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width var(--transition-slow);
      overflow: hidden;

      &.collapsed {
        width: var(--sidebar-collapsed-width);
      }
    }

    .sidebar-header {
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      min-height: 72px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      overflow: hidden;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: var(--radius-md);
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons-round {
        font-size: 22px;
        color: #fff;
      }
    }

    .logo-text {
      white-space: nowrap;

      h1 {
        font-size: 1.2rem;
        font-weight: 800;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
      }

      span {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 600;
      }
    }

    .toggle-btn {
      width: 28px;
      height: 28px;
      min-width: 28px;
      border: none;
      border-radius: var(--radius-sm);
      background: var(--bg-input);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);

      .material-icons-round { font-size: 18px; }

      &:hover {
        background: rgba(161, 35, 43, 0.15);
        color: var(--accent-primary);
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-md) var(--spacing-sm);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: all var(--transition-fast);
      white-space: nowrap;
      position: relative;
      overflow: hidden;

      .material-icons-round {
        font-size: 22px;
        min-width: 22px;
      }

      &:hover {
        background: rgba(161, 35, 43, 0.08);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(161, 35, 43, 0.15);
        color: var(--accent-primary-light);
        font-weight: 600;
        box-shadow: var(--metallic-bevel);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 4px;
          border-radius: 0 4px 4px 0;
          background: var(--gradient-primary);
        }
      }
    }

    .sidebar-footer {
      padding: var(--spacing-md) var(--spacing-lg);
      border-top: 1px solid var(--border-color);
      text-align: center;

      .version-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        color: var(--text-muted);
        font-size: 0.8rem;
        margin-bottom: 4px;

        .material-icons-round { font-size: 14px; }
      }

      small {
        color: var(--text-muted);
        font-size: 0.7rem;
        opacity: 0.6;
      }
    }
  `]
})
export class SidebarComponent {
  isCollapsed = false;

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
