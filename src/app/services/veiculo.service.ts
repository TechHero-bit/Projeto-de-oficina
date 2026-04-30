import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Veiculo } from '../models/veiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/veiculos';

  getVeiculos(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

  getVeiculoById(id: number): Observable<Veiculo | undefined> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }

  getVeiculosByCliente(clienteId: number): Observable<Veiculo[]> {
    // Busca todos e filtra localmente, ou idealmente o backend teria uma rota /api/clientes/:id/veiculos
    return this.getVeiculos().pipe(
      map(veiculos => veiculos.filter(v => v.clienteId === clienteId))
    );
  }

  addVeiculo(veiculo: Omit<Veiculo, 'id'>): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, veiculo);
  }

  updateVeiculo(id: number, data: Partial<Veiculo>): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${id}`, data);
  }

  deleteVeiculo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTotal(): Observable<number> {
    return this.getVeiculos().pipe(map(v => v.length));
  }
}
