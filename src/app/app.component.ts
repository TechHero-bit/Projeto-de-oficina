import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-layout">
      <app-sidebar *ngIf="showSidebar"></app-sidebar>
      <main class="main-content" [class.no-sidebar]="!showSidebar">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left var(--transition-slow);
      min-height: 100vh;
      background: var(--bg-primary);
    }
    
    .main-content.no-sidebar {
      margin-left: 0;
    }
  `]
})
export class AppComponent {
  title = 'OFIMEC';
  showSidebar = false;
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showSidebar = !event.urlAfterRedirects.includes('/login');
    });
  }
}
