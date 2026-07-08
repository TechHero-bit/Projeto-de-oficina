import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';
import { ClienteDialogComponent } from './cliente-dialog.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page animate-fade-in-up">
      <div class="page-header">
        <div class="page-title"><h1>Clientes</h1><p>Gerencie os clientes da oficina</p></div>
        <div class="header-actions">
          <div class="search-bar">
            <span class="material-icons-round">search</span>
            <input type="text" class="form-control" placeholder="Buscar cliente..." [(ngModel)]="searchTerm" (ngModelChange)="filterClientes()" id="search-clientes">
          </div>
          <button class="btn btn-primary" (click)="openModal()" id="btn-new-cliente"><span class="material-icons-round">person_add</span> Novo Cliente</button>
        </div>
      </div>
      <div class="card table-card">
        <div class="table-responsive">
          <table class="data-table" *ngIf="filteredClientes.length > 0">
            <thead><tr><th>ID</th><th>Nome</th><th>CPF</th><th>Telefone</th><th>Email</th><th>Cadastro</th><th>Ações</th></tr></thead>
            <tbody>
              <tr *ngFor="let cliente of filteredClientes; let i = index" [style.animation-delay]="i * 50 + 'ms'" class="animate-fade-in">
                <td><span class="id-badge">#{{ cliente.id }}</span></td>
                <td><div class="client-name"><div class="avatar">{{ cliente.initials }}</div><div><strong>{{ cliente.nome }}</strong><small>{{ cliente.endereco }}</small></div></div></td>
                <td>{{ cliente.cpf }}</td><td>{{ cliente.telefone }}</td><td>{{ cliente.email }}</td><td>{{ cliente.dataCadastro | date:'dd/MM/yyyy' }}</td>
                <td><div class="action-btns">
                  <button class="btn-icon" (click)="editCliente(cliente)" title="Editar"><span class="material-icons-round">edit</span></button>
                  <button class="btn-icon danger" (click)="confirmDelete(cliente)" title="Excluir"><span class="material-icons-round">delete</span></button>
                </div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="filteredClientes.length === 0"><span class="material-icons-round">people_outline</span><h3>Nenhum cliente encontrado</h3><p>{{ searchTerm ? 'Tente outra busca' : 'Cadastre o primeiro cliente' }}</p></div>
      </div>

      <div class="modal-backdrop" *ngIf="showDeleteConfirm" (click)="showDeleteConfirm = false">
        <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
          <div class="delete-icon"><span class="material-icons-round">warning</span></div>
          <h3>Confirmar Exclusão</h3><p>Deseja realmente excluir o cliente <strong>{{ clienteToDelete?.nome }}</strong>?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showDeleteConfirm = false">Cancelar</button>
            <button class="btn btn-danger" (click)="deleteCliente()" id="btn-confirm-delete"><span class="material-icons-round">delete</span> Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {
  clientes: (Cliente & { initials?: string })[] = []; 
  filteredClientes: (Cliente & { initials?: string })[] = []; 
  searchTerm = '';
  showDeleteConfirm = false; 
  clienteToDelete: Cliente | null = null;

  constructor(
    private clienteService: ClienteService, 
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClientes();
    this.route.queryParams.subscribe(params => { if (params['action'] === 'new') { this.openModal(); } });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe(clientes => { 
      this.clientes = clientes.map(c => ({
        ...c,
        initials: this.getInitials(c.nome)
      })); 
      this.filterClientes(); 
      this.cdr.markForCheck();
    });
  }

  filterClientes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(c => c.nome.toLowerCase().includes(term) || c.cpf.includes(term) || c.email.toLowerCase().includes(term) || c.telefone.includes(term));
    this.cdr.markForCheck();
  }

  getInitials(nome: string): string { return nome ? nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : ''; }
  openModal(): void { 
    this.openDialog({ nome: '', cpf: '', telefone: '', email: '', endereco: '' }, false); 
  }
  
  editCliente(cliente: Cliente): void { 
    this.openDialog({ ...cliente }, true); 
  }
  
  private openDialog(cliente: Partial<Cliente>, isEditing: boolean): void {
    const dialogRef = this.dialog.open(ClienteDialogComponent, {
      width: '560px',
      data: { cliente, isEditing },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCliente(result, isEditing);
      }
    });
  }

  saveCliente(clienteData: Partial<Cliente>, isEditing: boolean): void {
    if (isEditing && clienteData.id) { 
      this.clienteService.updateCliente(clienteData.id, clienteData).subscribe(() => this.loadClientes()); 
    } else { 
      this.clienteService.addCliente(clienteData as Omit<Cliente, 'id' | 'dataCadastro'>).subscribe(() => this.loadClientes()); 
    }
  }

  confirmDelete(cliente: Cliente): void { this.clienteToDelete = cliente; this.showDeleteConfirm = true; }
  deleteCliente(): void { 
    if (this.clienteToDelete) { 
      this.clienteService.deleteCliente(this.clienteToDelete.id).subscribe(() => this.loadClientes()); 
      this.showDeleteConfirm = false; 
      this.clienteToDelete = null; 
    } 
  }
}
