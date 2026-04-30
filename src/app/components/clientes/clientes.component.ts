import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                <td><div class="client-name"><div class="avatar">{{ getInitials(cliente.nome) }}</div><div><strong>{{ cliente.nome }}</strong><small>{{ cliente.endereco }}</small></div></div></td>
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
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>{{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</h2><button class="btn-icon" (click)="closeModal()"><span class="material-icons-round">close</span></button></div>
          <form (ngSubmit)="saveCliente()">
            <div class="form-group"><label for="nome">Nome Completo</label><input type="text" class="form-control" id="nome" [(ngModel)]="currentCliente.nome" name="nome" placeholder="Ex: João da Silva" required></div>
            <div class="form-row">
              <div class="form-group"><label for="cpf">CPF</label><input type="text" class="form-control" id="cpf" [(ngModel)]="currentCliente.cpf" name="cpf" placeholder="000.000.000-00"></div>
              <div class="form-group"><label for="telefone">Telefone</label><input type="text" class="form-control" id="telefone" [(ngModel)]="currentCliente.telefone" name="telefone" placeholder="(00) 00000-0000"></div>
            </div>
            <div class="form-group"><label for="email">Email</label><input type="email" class="form-control" id="email" [(ngModel)]="currentCliente.email" name="email" placeholder="email@exemplo.com"></div>
            <div class="form-group"><label for="endereco">Endereço</label><input type="text" class="form-control" id="endereco" [(ngModel)]="currentCliente.endereco" name="endereco" placeholder="Rua, número - Cidade/UF"></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-cliente"><span class="material-icons-round">save</span> {{ isEditing ? 'Atualizar' : 'Cadastrar' }}</button>
            </div>
          </form>
        </div>
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
  clientes: Cliente[] = []; filteredClientes: Cliente[] = []; searchTerm = '';
  showModal = false; showDeleteConfirm = false; isEditing = false;
  currentCliente: Partial<Cliente> = {}; clienteToDelete: Cliente | null = null;

  constructor(private clienteService: ClienteService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadClientes();
    this.route.queryParams.subscribe(params => { if (params['action'] === 'new') { this.openModal(); } });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe(clientes => { this.clientes = clientes; this.filterClientes(); });
  }

  filterClientes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(c => c.nome.toLowerCase().includes(term) || c.cpf.includes(term) || c.email.toLowerCase().includes(term) || c.telefone.includes(term));
  }

  getInitials(nome: string): string { return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(); }
  openModal(): void { this.currentCliente = { nome: '', cpf: '', telefone: '', email: '', endereco: '' }; this.isEditing = false; this.showModal = true; }
  editCliente(cliente: Cliente): void { this.currentCliente = { ...cliente }; this.isEditing = true; this.showModal = true; }
  closeModal(): void { this.showModal = false; this.currentCliente = {}; }

  saveCliente(): void {
    if (!this.currentCliente.nome) return;
    if (this.isEditing && this.currentCliente.id) { 
      this.clienteService.updateCliente(this.currentCliente.id, this.currentCliente).subscribe(() => this.loadClientes()); 
    } else { 
      this.clienteService.addCliente(this.currentCliente as Omit<Cliente, 'id' | 'dataCadastro'>).subscribe(() => this.loadClientes()); 
    }
    this.closeModal();
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
