import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/clientes';

  // Opcionalmente podemos usar Subjects caso o sistema precise de estado local, 
  // mas vamos focar na API rest agora.
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getClienteById(id: number): Observable<Cliente | undefined> {
    // Busca do backend ou filtra da lista se quiser cache. Por simplificacao, buscará todos ou da API (ainda a implementar GET /id na API)
    return this.http.get<Cliente[]>(this.apiUrl).pipe(
      map(clientes => clientes.find(c => c.id === id))
    );
  }

  addCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  // Métodos de update/delete fakes caso a API não tenha endpoints,
  // Para completar a implementação, deveriamos criar os endpoints lá no server.js
  updateCliente(id: number, data: Partial<Cliente>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTotal(): Observable<number> {
    return this.getClientes().pipe(map(c => c.length));
  }
}
