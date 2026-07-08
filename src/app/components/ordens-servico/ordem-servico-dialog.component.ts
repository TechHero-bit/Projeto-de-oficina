import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { OrdemServico, ServicoItem } from '../../models/ordem-servico.model';
import { Cliente } from '../../models/cliente.model';
import { Veiculo } from '../../models/veiculo.model';

export interface OrdemServicoDialogData {
  ordem: Partial<OrdemServico>;
  isEditing: boolean;
  clientes: Cliente[];
  veiculos: Veiculo[];
}

@Component({
  selector: 'app-ordem-servico-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="modal-content-dialog">
      <div class="modal-header">
        <h2>{{ data.isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço' }}</h2>
        <button class="btn-icon" type="button" (click)="onCancel()"><span class="material-icons-round">close</span></button>
      </div>
      <form (ngSubmit)="onSave()">
        <div class="form-row">
          <div class="form-group">
            <label for="os-cliente">Cliente</label>
            <select class="form-control" id="os-cliente" [(ngModel)]="selectedClienteId" name="clienteId" (ngModelChange)="onClienteChange(true)" required>
              <option [ngValue]="undefined" disabled>Selecione o cliente</option>
              <option *ngFor="let c of data.clientes" [ngValue]="c.id">{{ c.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="os-veiculo">Veículo</label>
            <select class="form-control" id="os-veiculo" [(ngModel)]="selectedVeiculoId" name="veiculoId" required>
              <option [ngValue]="undefined" disabled>Selecione o veículo</option>
              <option *ngFor="let v of clienteVeiculos" [ngValue]="v.id">{{ v.marca }} {{ v.modelo }} - {{ v.placa }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="os-problema">Descrição do Problema</label>
          <textarea class="form-control" id="os-problema" [(ngModel)]="currentOrdem.descricaoProblema" name="descricaoProblema" placeholder="Descreva o problema" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label>Serviços</label>
          <div class="services-form">
            <div class="service-form-item" *ngFor="let servico of currentServicos; let i = index">
              <input type="text" class="form-control" [(ngModel)]="servico.descricao" [name]="'sDesc' + i" placeholder="Descrição do serviço" required>
              <input type="number" class="form-control service-value-input" [(ngModel)]="servico.valor" [name]="'sVal' + i" placeholder="Valor" step="0.01" required>
              <button type="button" class="btn-icon danger" (click)="removeServico(i)" *ngIf="currentServicos.length > 1"><span class="material-icons-round">remove_circle</span></button>
            </div>
            <button type="button" class="btn btn-secondary" (click)="addServico()"><span class="material-icons-round">add</span> Adicionar Serviço</button>
          </div>
          <div class="total-preview" *ngIf="currentServicos.length">Total: <strong>R$ {{ getServicosTotal() | number:'1.2-2' }}</strong></div>
        </div>
        <div class="form-row" *ngIf="data.isEditing">
          <div class="form-group">
            <label for="os-status">Status</label>
            <select class="form-control" id="os-status" [(ngModel)]="currentOrdem.status" name="status">
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="os-obs">Observações</label>
          <textarea class="form-control" id="os-obs" [(ngModel)]="currentOrdem.observacoes" name="observacoes" placeholder="Observações adicionais" rows="2"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-save-ordem">
            <span class="material-icons-round">save</span> {{ data.isEditing ? 'Atualizar' : 'Criar Ordem' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .modal-content-dialog {
      background: var(--bg-primary);
      padding: var(--spacing-xl);
      width: 100%;
      min-width: 400px;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--spacing-sm);
    }
    .modal-header h2 { font-size: 1.8rem; margin: 0; color: var(--accent-primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md); }
    .form-group { margin-bottom: var(--spacing-md); }
    .services-form { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .service-form-item { display: flex; gap: var(--spacing-sm); align-items: center; }
    .service-form-item input:first-child { flex: 2; }
    .service-form-item .service-value-input { flex: 1; }
    .total-preview { text-align: right; padding: var(--spacing-sm) 0; font-size: 0.9rem; color: var(--text-secondary); }
    .total-preview strong { color: var(--accent-primary); font-size: 1.1rem; }
    .modal-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class OrdemServicoDialogComponent implements OnInit {
  currentOrdem: Partial<OrdemServico>;
  currentServicos: ServicoItem[];
  selectedClienteId?: number;
  selectedVeiculoId?: number;
  clienteVeiculos: Veiculo[] = [];

  constructor(
    public dialogRef: MatDialogRef<OrdemServicoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrdemServicoDialogData
  ) {
    this.currentOrdem = { ...data.ordem };
    this.currentServicos = data.ordem.servicos && data.ordem.servicos.length > 0 
      ? [...data.ordem.servicos.map(s => ({...s}))] 
      : [{ descricao: '', valor: 0 }];
    this.selectedClienteId = data.ordem.clienteId;
    this.selectedVeiculoId = data.ordem.veiculoId;
  }

  ngOnInit(): void {
    if (this.selectedClienteId) {
      this.onClienteChange(false);
    }
  }

  onClienteChange(resetVeiculo = true): void {
    this.clienteVeiculos = this.data.veiculos.filter(v => v.clienteId === this.selectedClienteId);
    if (resetVeiculo) {
      this.selectedVeiculoId = undefined;
    }
  }

  addServico(): void { this.currentServicos.push({ descricao: '', valor: 0 }); }
  removeServico(index: number): void { this.currentServicos.splice(index, 1); }
  getServicosTotal(): number { return this.currentServicos.reduce((sum, s) => sum + (s.valor || 0), 0); }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.currentOrdem.descricaoProblema || !this.selectedClienteId || !this.selectedVeiculoId) return;
    const validServicos = this.currentServicos.filter(s => s.descricao && s.valor > 0);
    if (validServicos.length === 0) return;
    
    const cliente = this.data.clientes.find(c => c.id === this.selectedClienteId);
    const veiculo = this.data.veiculos.find(v => v.id === this.selectedVeiculoId);
    
    const ordemData: Partial<OrdemServico> = {
      ...this.currentOrdem,
      clienteId: this.selectedClienteId,
      clienteNome: cliente?.nome,
      veiculoId: this.selectedVeiculoId,
      veiculoInfo: veiculo ? `${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} - ${veiculo.placa}` : '',
      servicos: validServicos
    };

    this.dialogRef.close(ordemData);
  }
}
