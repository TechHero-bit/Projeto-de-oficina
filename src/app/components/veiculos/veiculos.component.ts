import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VeiculoService } from '../../services/veiculo.service';
import { ClienteService } from '../../services/cliente.service';
import { Veiculo } from '../../models/veiculo.model';
import { Cliente } from '../../models/cliente.model';
import { VeiculoDialogComponent } from './veiculo-dialog.component';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  searchTerm = ''; showDeleteConfirm = false;
  veiculoToDelete: Veiculo | null = null;

  constructor(
    private veiculoService: VeiculoService, 
    private clienteService: ClienteService, 
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVeiculos();
    this.clienteService.getClientes().subscribe(c => { this.clientes = c; this.cdr.markForCheck(); });
    this.route.queryParams.subscribe(params => { if (params['action'] === 'new') { this.openModal(); } });
  }

  loadVeiculos(): void {
    this.veiculoService.getVeiculos().subscribe(v => { this.veiculos = v; this.filterVeiculos(); this.cdr.markForCheck(); });
  }

  filterVeiculos(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredVeiculos = this.veiculos.filter(v => v.marca.toLowerCase().includes(term) || v.modelo.toLowerCase().includes(term) || v.placa.toLowerCase().includes(term) || (v.clienteNome && v.clienteNome.toLowerCase().includes(term)));
    this.cdr.markForCheck();
  }

  openModal(): void { 
    this.openDialog({ marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', cor: '', quilometragem: 0 }, false); 
  }
  
  editVeiculo(veiculo: Veiculo): void { 
    this.openDialog({ ...veiculo }, true); 
  }
  
  private openDialog(veiculo: Partial<Veiculo>, isEditing: boolean): void {
    const dialogRef = this.dialog.open(VeiculoDialogComponent, {
      width: '560px',
      data: { veiculo, isEditing, clientes: this.clientes },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveVeiculo(result, isEditing);
      }
    });
  }

  saveVeiculo(veiculoData: Partial<Veiculo>, isEditing: boolean): void {
    if (!veiculoData.marca || !veiculoData.modelo) return;
    const cliente = this.clientes.find(c => c.id === veiculoData.clienteId);
    if (cliente) { veiculoData.clienteNome = cliente.nome; }
    
    if (isEditing && veiculoData.id) { 
      this.veiculoService.updateVeiculo(veiculoData.id, veiculoData).subscribe(() => this.loadVeiculos()); 
    } else { 
      this.veiculoService.addVeiculo(veiculoData as Omit<Veiculo, 'id'>).subscribe(() => this.loadVeiculos()); 
    }
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
