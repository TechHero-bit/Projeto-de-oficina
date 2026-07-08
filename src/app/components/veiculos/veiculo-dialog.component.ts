import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Veiculo } from '../../models/veiculo.model';
import { Cliente } from '../../models/cliente.model';

export interface VeiculoDialogData {
  veiculo: Partial<Veiculo>;
  isEditing: boolean;
  clientes: Cliente[];
}

@Component({
  selector: 'app-veiculo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="modal-content-dialog">
      <div class="modal-header">
        <h2>{{ data.isEditing ? 'Editar Veículo' : 'Novo Veículo' }}</h2>
        <button class="btn-icon" type="button" (click)="onCancel()"><span class="material-icons-round">close</span></button>
      </div>
      <form (ngSubmit)="onSave()">
        <div class="form-group">
          <label for="clienteId">Proprietário</label>
          <select class="form-control" id="clienteId" [(ngModel)]="data.veiculo.clienteId" name="clienteId" required>
            <option [ngValue]="undefined" disabled>Selecione o cliente</option>
            <option *ngFor="let c of data.clientes" [ngValue]="c.id">{{ c.nome }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="marca">Marca</label>
            <input type="text" class="form-control" id="marca" [(ngModel)]="data.veiculo.marca" name="marca" placeholder="Ex: Toyota" required>
          </div>
          <div class="form-group">
            <label for="modelo">Modelo</label>
            <input type="text" class="form-control" id="modelo" [(ngModel)]="data.veiculo.modelo" name="modelo" placeholder="Ex: Corolla" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="ano">Ano</label>
            <input type="number" class="form-control" id="ano" [(ngModel)]="data.veiculo.ano" name="ano" placeholder="2024">
          </div>
          <div class="form-group">
            <label for="placa">Placa</label>
            <input type="text" class="form-control" id="placa" [(ngModel)]="data.veiculo.placa" name="placa" placeholder="ABC-1D23">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cor">Cor</label>
            <input type="text" class="form-control" id="cor" [(ngModel)]="data.veiculo.cor" name="cor" placeholder="Prata">
          </div>
          <div class="form-group">
            <label for="km">Quilometragem</label>
            <input type="number" class="form-control" id="km" [(ngModel)]="data.veiculo.quilometragem" name="quilometragem" placeholder="0">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-save-veiculo">
            <span class="material-icons-round">save</span> {{ data.isEditing ? 'Atualizar' : 'Cadastrar' }}
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
    .form-row { display: flex; gap: var(--spacing-md); }
    .form-row .form-group { flex: 1; }
    .modal-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class VeiculoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VeiculoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VeiculoDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.veiculo.marca && this.data.veiculo.modelo) {
      this.dialogRef.close(this.data.veiculo);
    }
  }
}
