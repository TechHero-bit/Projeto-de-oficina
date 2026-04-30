import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VeiculoService } from '../../services/veiculo.service';
import { ClienteService } from '../../services/cliente.service';
import { Veiculo } from '../../models/veiculo.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in-up">
      <div class="page-header">
        <div class="page-title"><h1>Veículos</h1><p>Gerencie os veículos cadastrados</p></div>
        <div class="header-actions">
          <div class="search-bar"><span class="material-icons-round">search</span><input type="text" class="form-control" placeholder="Buscar veículo..." [(ngModel)]="searchTerm" (ngModelChange)="filterVeiculos()" id="search-veiculos"></div>
          <button class="btn btn-primary" (click)="openModal()" id="btn-new-veiculo"><span class="material-icons-round">add_circle</span> Novo Veículo</button>
        </div>
      </div>
      <div class="vehicles-grid">
        <div class="vehicle-card card" *ngFor="let veiculo of filteredVeiculos; let i = index" [style.animation-delay]="i * 80 + 'ms'">
          <div class="vehicle-header">
            <div class="vehicle-icon"><span class="material-icons-round">directions_car</span></div>
            <div class="vehicle-actions">
              <button class="btn-icon" (click)="editVeiculo(veiculo)" title="Editar"><span class="material-icons-round">edit</span></button>
              <button class="btn-icon danger" (click)="confirmDelete(veiculo)" title="Excluir"><span class="material-icons-round">delete</span></button>
            </div>
          </div>
          <div class="vehicle-body"><h3>{{ veiculo.marca }} {{ veiculo.modelo }}</h3><span class="vehicle-year">{{ veiculo.ano }}</span></div>
          <div class="vehicle-details">
            <div class="detail"><span class="material-icons-round">badge</span><span>{{ veiculo.placa }}</span></div>
            <div class="detail"><span class="material-icons-round">palette</span><span>{{ veiculo.cor }}</span></div>
            <div class="detail"><span class="material-icons-round">speed</span><span>{{ veiculo.quilometragem | number }} km</span></div>
            <div class="detail"><span class="material-icons-round">person</span><span>{{ veiculo.clienteNome }}</span></div>
          </div>
        </div>
      </div>
      <div class="card" *ngIf="filteredVeiculos.length === 0"><div class="empty-state"><span class="material-icons-round">directions_car</span><h3>Nenhum veículo encontrado</h3><p>{{ searchTerm ? 'Tente outra busca' : 'Cadastre o primeiro veículo' }}</p></div></div>
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>{{ isEditing ? 'Editar Veículo' : 'Novo Veículo' }}</h2><button class="btn-icon" (click)="closeModal()"><span class="material-icons-round">close</span></button></div>
          <form (ngSubmit)="saveVeiculo()">
            <div class="form-group"><label for="clienteId">Proprietário</label>
              <select class="form-control" id="clienteId" [(ngModel)]="currentVeiculo.clienteId" name="clienteId" required><option [ngValue]="undefined" disabled>Selecione o cliente</option><option *ngFor="let c of clientes" [ngValue]="c.id">{{ c.nome }}</option></select>
            </div>
            <div class="form-row">
              <div class="form-group"><label for="marca">Marca</label><input type="text" class="form-control" id="marca" [(ngModel)]="currentVeiculo.marca" name="marca" placeholder="Ex: Toyota" required></div>
              <div class="form-group"><label for="modelo">Modelo</label><input type="text" class="form-control" id="modelo" [(ngModel)]="currentVeiculo.modelo" name="modelo" placeholder="Ex: Corolla" required></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label for="ano">Ano</label><input type="number" class="form-control" id="ano" [(ngModel)]="currentVeiculo.ano" name="ano" placeholder="2024"></div>
              <div class="form-group"><label for="placa">Placa</label><input type="text" class="form-control" id="placa" [(ngModel)]="currentVeiculo.placa" name="placa" placeholder="ABC-1D23"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label for="cor">Cor</label><input type="text" class="form-control" id="cor" [(ngModel)]="currentVeiculo.cor" name="cor" placeholder="Prata"></div>
              <div class="form-group"><label for="km">Quilometragem</label><input type="number" class="form-control" id="km" [(ngModel)]="currentVeiculo.quilometragem" name="quilometragem" placeholder="0"></div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-veiculo"><span class="material-icons-round">save</span> {{ isEditing ? 'Atualizar' : 'Cadastrar' }}</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm" (click)="showDeleteConfirm = false">
        <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
          <div class="delete-icon"><span class="material-icons-round">warning</span></div>
          <h3>Confirmar Exclusão</h3><p>Deseja realmente excluir o veículo <strong>{{ veiculoToDelete?.marca }} {{ veiculoToDelete?.modelo }}</strong>?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showDeleteConfirm = false">Cancelar</button>
            <button class="btn btn-danger" (click)="deleteVeiculo()" id="btn-confirm-delete-veiculo"><span class="material-icons-round">delete</span> Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./veiculos.component.scss']
})
export class VeiculosComponent implements OnInit {
  veiculos: Veiculo[] = []; filteredVeiculos: Veiculo[] = []; clientes: Cliente[] = [];
  searchTerm = ''; showModal = false; showDeleteConfirm = false; isEditing = false;
  currentVeiculo: Partial<Veiculo> = {}; veiculoToDelete: Veiculo | null = null;

  constructor(private veiculoService: VeiculoService, private clienteService: ClienteService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadVeiculos();
    this.clienteService.getClientes().subscribe(c => { this.clientes = c; });
    this.route.queryParams.subscribe(params => { if (params['action'] === 'new') { this.openModal(); } });
  }

  loadVeiculos(): void {
    this.veiculoService.getVeiculos().subscribe(v => { this.veiculos = v; this.filterVeiculos(); });
  }

  filterVeiculos(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredVeiculos = this.veiculos.filter(v => v.marca.toLowerCase().includes(term) || v.modelo.toLowerCase().includes(term) || v.placa.toLowerCase().includes(term) || (v.clienteNome && v.clienteNome.toLowerCase().includes(term)));
  }

  openModal(): void { this.currentVeiculo = { marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', cor: '', quilometragem: 0 }; this.isEditing = false; this.showModal = true; }
  editVeiculo(veiculo: Veiculo): void { this.currentVeiculo = { ...veiculo }; this.isEditing = true; this.showModal = true; }
  closeModal(): void { this.showModal = false; this.currentVeiculo = {}; }

  saveVeiculo(): void {
    if (!this.currentVeiculo.marca || !this.currentVeiculo.modelo) return;
    const cliente = this.clientes.find(c => c.id === this.currentVeiculo.clienteId);
    if (cliente) { this.currentVeiculo.clienteNome = cliente.nome; }
    if (this.isEditing && this.currentVeiculo.id) { 
      this.veiculoService.updateVeiculo(this.currentVeiculo.id, this.currentVeiculo).subscribe(() => this.loadVeiculos()); 
    } else { 
      this.veiculoService.addVeiculo(this.currentVeiculo as Omit<Veiculo, 'id'>).subscribe(() => this.loadVeiculos()); 
    }
    this.closeModal();
  }

  confirmDelete(veiculo: Veiculo): void { this.veiculoToDelete = veiculo; this.showDeleteConfirm = true; }
  deleteVeiculo(): void { 
    if (this.veiculoToDelete) { 
      this.veiculoService.deleteVeiculo(this.veiculoToDelete.id).subscribe(() => this.loadVeiculos()); 
      this.showDeleteConfirm = false; 
      this.veiculoToDelete = null; 
    } 
  }
}
