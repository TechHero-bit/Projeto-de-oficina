import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { ClienteService } from '../../services/cliente.service';
import { VeiculoService } from '../../services/veiculo.service';
import { OrdemServico, StatusOS, ServicoItem } from '../../models/ordem-servico.model';
import { Cliente } from '../../models/cliente.model';
import { Veiculo } from '../../models/veiculo.model';
import { OrdemServicoDialogComponent } from './ordem-servico-dialog.component';

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="page animate-fade-in-up">
      <div class="page-header">
        <div class="page-title">
          <h1>Ordens de Serviço</h1>
          <p>Gerencie as ordens de serviço da oficina</p>
        </div>
        <div class="header-actions">
          <div class="search-bar">
            <span class="material-icons-round">search</span>
            <input type="text" class="form-control" placeholder="Buscar ordem..."
                   [(ngModel)]="searchTerm" (ngModelChange)="filterOrdens()" id="search-ordens">
          </div>
          <select class="form-control filter-select" [(ngModel)]="statusFilter" (ngModelChange)="filterOrdens()" id="filter-status">
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <button class="btn btn-primary" (click)="openModal()" id="btn-new-ordem">
            <span class="material-icons-round">note_add</span>
            Nova Ordem
          </button>
        </div>
      </div>
      <div class="orders-list">
        <div class="order-card card" *ngFor="let ordem of filteredOrdens; let i = index"
             [style.animation-delay]="i * 60 + 'ms'">
          <div class="order-header">
            <div class="order-id-section">
              <span class="order-id">OS #{{ ordem.id }}</span>
              <span class="badge" [ngClass]="getStatusBadgeClass(ordem.status)">{{ getStatusLabel(ordem.status) }}</span>
            </div>
            <div class="order-actions">
              <button class="btn-icon" *ngIf="ordem.status === 'pendente'" (click)="updateStatus(ordem, 'em_andamento')" title="Iniciar Serviço"><span class="material-icons-round">play_arrow</span></button>
              <button class="btn-icon success" *ngIf="ordem.status === 'em_andamento'" (click)="updateStatus(ordem, 'concluida')" title="Concluir"><span class="material-icons-round">check</span></button>
              <button class="btn-icon" (click)="toggleDetails(ordem.id)" title="Detalhes"><span class="material-icons-round">{{ expandedOrder === ordem.id ? 'expand_less' : 'expand_more' }}</span></button>
              <button class="btn-icon" (click)="editOrdem(ordem)" title="Editar"><span class="material-icons-round">edit</span></button>
              <button class="btn-icon danger" (click)="confirmDelete(ordem)" title="Excluir"><span class="material-icons-round">delete</span></button>
            </div>
          </div>
          <div class="order-summary">
            <div class="order-info-row">
              <div class="info-item"><span class="material-icons-round">person</span><span>{{ ordem.clienteNome }}</span></div>
              <div class="info-item"><span class="material-icons-round">directions_car</span><span>{{ ordem.veiculoInfo }}</span></div>
              <div class="info-item"><span class="material-icons-round">calendar_today</span><span>{{ ordem.dataAbertura | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item total"><span class="material-icons-round">payments</span><span>R$ {{ ordem.valorTotal | number:'1.2-2' }}</span></div>
            </div>
          </div>
          <div class="order-details" *ngIf="expandedOrder === ordem.id">
            <div class="detail-section"><h4>Problema Relatado</h4><p>{{ ordem.descricaoProblema }}</p></div>
            <div class="detail-section">
              <h4>Serviços</h4>
              <div class="services-list">
                <div class="service-item" *ngFor="let servico of ordem.servicos"><span>{{ servico.descricao }}</span><span class="service-value">R$ {{ servico.valor | number:'1.2-2' }}</span></div>
                <div class="service-total"><strong>Total</strong><strong>R$ {{ ordem.valorTotal | number:'1.2-2' }}</strong></div>
              </div>
            </div>
            <div class="detail-section" *ngIf="ordem.observacoes"><h4>Observações</h4><p>{{ ordem.observacoes }}</p></div>
            <div class="detail-section" *ngIf="ordem.dataConclusao"><h4>Data de Conclusão</h4><p>{{ ordem.dataConclusao | date:'dd/MM/yyyy' }}</p></div>
          </div>
        </div>
      </div>
      <div class="card" *ngIf="filteredOrdens.length === 0">
        <div class="empty-state">
          <span class="material-icons-round">assignment</span>
          <h3>Nenhuma ordem encontrada</h3>
          <p>{{ searchTerm || statusFilter ? 'Tente outros filtros' : 'Crie a primeira ordem de serviço' }}</p>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm" (click)="showDeleteConfirm = false">
        <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
          <div class="delete-icon"><span class="material-icons-round">warning</span></div>
          <h3>Confirmar Exclusão</h3>
          <p>Deseja realmente excluir a <strong>OS #{{ ordemToDelete?.id }}</strong>?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showDeleteConfirm = false">Cancelar</button>
            <button class="btn btn-danger" (click)="deleteOrdem()" id="btn-confirm-delete-ordem"><span class="material-icons-round">delete</span> Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ordens-servico.component.scss']
})
export class OrdensServicoComponent implements OnInit {
  ordens: OrdemServico[] = [];
  filteredOrdens: OrdemServico[] = [];
  clientes: Cliente[] = [];
  veiculos: Veiculo[] = [];
  searchTerm = '';
  statusFilter = '';
  showDeleteConfirm = false;
  expandedOrder: number | null = null;
  ordemToDelete: OrdemServico | null = null;

  constructor(
    private ordemService: OrdemServicoService, 
    private clienteService: ClienteService, 
    private veiculoService: VeiculoService, 
    private route: ActivatedRoute, 
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadOrdens();
    this.clienteService.getClientes().subscribe(clientes => { this.clientes = clientes; this.cdr.detectChanges(); });
    this.veiculoService.getVeiculos().subscribe(veiculos => { this.veiculos = veiculos; this.cdr.detectChanges(); });
    this.route.queryParams.subscribe(params => { if (params['action'] === 'new') { this.openModal(); } });
  }

  loadOrdens(): void {
    this.ordemService.getOrdens().subscribe({
      next: (ordens) => { this.ordens = ordens; this.filterOrdens(); this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar Ordens de Serviço (possível erro de RLS):', err)
    });
  }

  filterOrdens(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredOrdens = this.ordens.filter(o => {
      const matchSearch = !term || o.clienteNome?.toLowerCase().includes(term) || o.veiculoInfo?.toLowerCase().includes(term) || o.descricaoProblema.toLowerCase().includes(term) || o.id.toString().includes(term);
      const matchStatus = !this.statusFilter || o.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { 'pendente': 'Pendente', 'em_andamento': 'Em Andamento', 'concluida': 'Concluída', 'cancelada': 'Cancelada' };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = { 'pendente': 'badge-pending', 'em_andamento': 'badge-in-progress', 'concluida': 'badge-completed', 'cancelada': 'badge-cancelled' };
    return classes[status] || '';
  }

  toggleDetails(id: number): void { this.expandedOrder = this.expandedOrder === id ? null : id; }
  updateStatus(ordem: OrdemServico, status: StatusOS): void { this.ordemService.updateStatus(ordem.id, status).subscribe(() => { this.loadOrdens(); this.cdr.detectChanges(); }); }

  openModal(): void {
    this.openDialog({ descricaoProblema: '', observacoes: '', status: 'pendente' }, false);
  }

  editOrdem(ordem: OrdemServico): void {
    this.openDialog({ ...ordem }, true);
  }

  private openDialog(ordem: Partial<OrdemServico>, isEditing: boolean): void {
    const dialogRef = this.dialog.open(OrdemServicoDialogComponent, {
      width: '680px',
      data: { 
        ordem, 
        isEditing,
        clientes: this.clientes,
        veiculos: this.veiculos
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveOrdem(result, isEditing);
      }
    });
  }

  saveOrdem(ordemData: any, isEditing: boolean): void {
    if (isEditing && ordemData.id) { 
      this.ordemService.updateOrdem(ordemData.id, ordemData).subscribe({
        next: () => { this.loadOrdens(); this.cdr.detectChanges(); },
        error: (err) => console.error('Erro ao atualizar OS:', err)
      }); 
    } else { 
      this.ordemService.addOrdem(ordemData).subscribe({
        next: () => { this.loadOrdens(); this.cdr.detectChanges(); },
        error: (err) => console.error('Erro ao adicionar OS:', err)
      }); 
    }
  }

  confirmDelete(ordem: OrdemServico): void { this.ordemToDelete = ordem; this.showDeleteConfirm = true; }
  deleteOrdem(): void { 
    if (this.ordemToDelete) { 
      this.ordemService.deleteOrdem(this.ordemToDelete.id).subscribe({
        next: () => { this.loadOrdens(); this.cdr.detectChanges(); },
        error: (err) => console.error('Erro ao excluir OS:', err)
      }); 
      this.showDeleteConfirm = false; 
      this.ordemToDelete = null; 
    } 
  }
}
