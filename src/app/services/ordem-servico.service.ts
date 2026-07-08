import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { OrdemServico, StatusOS } from '../models/ordem-servico.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {
  private supabase = inject(SupabaseService).client;

  private mapStatusDbToApi(dbStatus: string): StatusOS {
    if (!dbStatus) return 'pendente';
    const status = dbStatus.toUpperCase();
    if (status === 'ABERTA' || status === 'PENDENTE') return 'pendente';
    if (status === 'EM_ANDAMENTO') return 'em_andamento';
    if (status === 'CONCLUIDA') return 'concluida';
    if (status === 'CANCELADA') return 'cancelada';
    return dbStatus.toLowerCase() as StatusOS;
  }

  private mapStatusApiToDb(apiStatus: string): string {
    if (!apiStatus) return 'ABERTA';
    const status = apiStatus.toLowerCase();
    if (status === 'pendente') return 'ABERTA';
    if (status === 'em_andamento') return 'EM_ANDAMENTO';
    if (status === 'concluida') return 'CONCLUIDA';
    if (status === 'cancelada') return 'CANCELADA';
    return apiStatus.toUpperCase();
  }

  private mapDbToModel(dbOS: any): OrdemServico {
    return {
      id: dbOS.id,
      clienteId: dbOS.cliente_id,
      clienteNome: dbOS.clientes?.nome,
      veiculoId: dbOS.veiculo_id,
      veiculoInfo: dbOS.veiculos ? `${dbOS.veiculos.marca} ${dbOS.veiculos.modelo}` : undefined,
      descricaoProblema: dbOS.descricao,
      servicos: (dbOS.itens_servico || []).map((item: any) => ({
        descricao: item.descricao,
        valor: Number(item.valor)
      })),
      status: this.mapStatusDbToApi(dbOS.status),
      dataAbertura: dbOS.data_criacao ? new Date(dbOS.data_criacao) : new Date(),
      dataConclusao: dbOS.data_conclusao ? new Date(dbOS.data_conclusao) : undefined,
      observacoes: dbOS.observacoes,
      valorTotal: Number(dbOS.valor_total)
    };
  }

  getOrdens(): Observable<OrdemServico[]> {
    return from(this.supabase.from('ordens_servico').select('*, clientes(nome), veiculos(marca, modelo), itens_servico(descricao, valor)').order('id', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(o => this.mapDbToModel(o));
      })
    );
  }

  getOrdemById(id: number): Observable<OrdemServico | undefined> {
    return from(this.supabase.from('ordens_servico').select('*, clientes(nome), veiculos(marca, modelo), itens_servico(descricao, valor)').eq('id', id).single()).pipe(
      map(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return undefined;
        return this.mapDbToModel(data);
      })
    );
  }

  addOrdem(ordem: Omit<OrdemServico, 'id' | 'dataAbertura' | 'valorTotal'>): Observable<OrdemServico> {
    const valorTotal = ordem.servicos ? ordem.servicos.reduce((sum, s) => sum + s.valor, 0) : 0;
    const numeroOs = `OS-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;
    const statusDb = this.mapStatusApiToDb(ordem.status || 'pendente');

    // Retorna uma Promise que resolve a criação da OS e dos itens para podermos usar o `from` do RxJS
    const createPromise = async () => {
      const { data: osData, error: osError } = await this.supabase.from('ordens_servico').insert([{
        cliente_id: ordem.clienteId,
        veiculo_id: ordem.veiculoId,
        descricao: ordem.descricaoProblema,
        observacoes: ordem.observacoes,
        valor_total: valorTotal,
        status: statusDb,
        numero_os: numeroOs
      }]).select().single();

      if (osError) throw osError;
      const osId = osData.id;

      if (ordem.servicos && ordem.servicos.length > 0) {
        const itensToInsert = ordem.servicos.map(s => ({
          ordem_servico_id: osId,
          descricao: s.descricao,
          valor: s.valor
        }));
        const { error: itemsError } = await this.supabase.from('itens_servico').insert(itensToInsert);
        if (itemsError) throw itemsError;
      }

      // Fetch created OS with all relations
      const { data: finalOs, error: fetchError } = await this.supabase.from('ordens_servico').select('*, clientes(nome), veiculos(marca, modelo), itens_servico(descricao, valor)').eq('id', osId).single();
      if (fetchError) throw fetchError;
      
      return this.mapDbToModel(finalOs);
    };

    return from(createPromise());
  }

  updateOrdem(id: number, data: Partial<OrdemServico>): Observable<any> {
    const updatePromise = async () => {
      const updateData: any = {};
      if (data.status) updateData.status = this.mapStatusApiToDb(data.status);
      if (data.status === 'concluida' && !data.dataConclusao) {
        updateData.data_conclusao = new Date().toISOString();
      }
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      
      let valorTotal = undefined;
      if (data.servicos) {
        valorTotal = data.servicos.reduce((sum, s) => sum + s.valor, 0);
        updateData.valor_total = valorTotal;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await this.supabase.from('ordens_servico').update(updateData).eq('id', id);
        if (error) throw error;
      }

      if (data.servicos && data.servicos.length > 0) {
        // Remove old items
        const { error: deleteError } = await this.supabase.from('itens_servico').delete().eq('ordem_servico_id', id);
        if (deleteError) throw deleteError;

        // Insert new items
        const itensToInsert = data.servicos.map(s => ({
          ordem_servico_id: id,
          descricao: s.descricao,
          valor: s.valor
        }));
        const { error: insertError } = await this.supabase.from('itens_servico').insert(itensToInsert);
        if (insertError) throw insertError;
      }

      return true;
    };

    return from(updatePromise());
  }

  updateStatus(id: number, status: StatusOS): Observable<any> {
    return this.updateOrdem(id, { status });
  }

  deleteOrdem(id: number): Observable<any> {
    return from(this.supabase.from('ordens_servico').delete().eq('id', id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  getTotal(): Observable<number> {
    return from(this.supabase.from('ordens_servico').select('*', { count: 'exact', head: true })).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return count || 0;
      })
    );
  }

  getByStatus(status: StatusOS): Observable<OrdemServico[]> {
    const dbStatus = this.mapStatusApiToDb(status);
    return from(this.supabase.from('ordens_servico').select('*, clientes(nome), veiculos(marca, modelo), itens_servico(descricao, valor)').eq('status', dbStatus).order('id', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(o => this.mapDbToModel(o));
      })
    );
  }

  getReceitaTotal(): Observable<number> {
    return from(this.supabase.from('ordens_servico').select('valor_total').eq('status', 'CONCLUIDA')).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).reduce((sum, o) => sum + Number(o.valor_total), 0);
      })
    );
  }
}
