import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrdemServico, StatusOS } from '../models/ordem-servico.model';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/ordens-servico';

  getOrdens(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  getOrdemById(id: number): Observable<OrdemServico | undefined> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`);
  }

  addOrdem(ordem: Omit<OrdemServico, 'id' | 'dataAbertura' | 'valorTotal'>): Observable<OrdemServico> {
    const valorTotal = ordem.servicos ? ordem.servicos.reduce((sum, s) => sum + s.valor, 0) : 0;
    const data = {
        ...ordem,
        valorTotal
    };
    return this.http.post<OrdemServico>(this.apiUrl, data);
  }

  updateOrdem(id: number, data: Partial<OrdemServico>): Observable<any> {
    const payload: any = { ...data };
    if (data.status === 'concluida' && !data.dataConclusao) {
      payload.dataConclusao = new Date();
    }
    if (data.servicos) {
      payload.valorTotal = data.servicos.reduce((sum, s) => sum + s.valor, 0);
    }
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  updateStatus(id: number, status: StatusOS): Observable<any> {
    return this.updateOrdem(id, { status });
  }

  deleteOrdem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTotal(): Observable<number> {
    return this.getOrdens().pipe(map(o => o.length));
  }

  getByStatus(status: StatusOS): Observable<OrdemServico[]> {
    return this.getOrdens().pipe(
      map(ordens => ordens.filter(o => o.status === status))
    );
  }

  getReceitaTotal(): Observable<number> {
    return this.getOrdens().pipe(
      map(ordens =>
        ordens
          .filter(o => o.status === 'concluida')
          .reduce((sum, o) => sum + Number(o.valorTotal), 0)
      )
    );
  }
}
