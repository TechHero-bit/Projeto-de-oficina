import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Cliente } from '../../models/cliente.model';

export interface ClienteDialogData {
  cliente: Partial<Cliente>;
  isEditing: boolean;
}

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="modal-content-dialog">
      <div class="modal-header">
        <h2>{{ data.isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
        <button class="btn-icon" type="button" (click)="onCancel()"><span class="material-icons-round">close</span></button>
      </div>
      <form (ngSubmit)="onSave()">
        <div class="form-group">
          <label for="nome">Nome Completo</label>
          <input type="text" class="form-control" id="nome" [(ngModel)]="data.cliente.nome" name="nome" placeholder="Ex: João da Silva" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cpf">CPF</label>
            <input type="text" class="form-control" id="cpf" [(ngModel)]="data.cliente.cpf" name="cpf" placeholder="000.000.000-00">
          </div>
          <div class="form-group">
            <label for="telefone">Telefone</label>
            <input type="text" class="form-control" id="telefone" [(ngModel)]="data.cliente.telefone" name="telefone" placeholder="(00) 00000-0000">
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" class="form-control" id="email" [(ngModel)]="data.cliente.email" name="email" placeholder="email@exemplo.com">
        </div>
        <div class="form-group">
          <label for="endereco">Endereço</label>
          <input type="text" class="form-control" id="endereco" [(ngModel)]="data.cliente.endereco" name="endereco" placeholder="Rua, número - Cidade/UF">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-save-cliente">
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
export class ClienteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.cliente.nome) {
      this.dialogRef.close(this.data.cliente);
    }
  }
}
