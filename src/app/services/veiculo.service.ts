import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Veiculo } from '../models/veiculo.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private supabase = inject(SupabaseService).client;

  getVeiculos(): Observable<Veiculo[]> {
    return from(this.supabase.from('veiculos').select('*, clientes(nome)').order('id', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(v => this.mapDbToModel(v));
      })
    );
  }

  getVeiculoById(id: number): Observable<Veiculo | undefined> {
    return from(this.supabase.from('veiculos').select('*, clientes(nome)').eq('id', id).single()).pipe(
      map(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return undefined;
        return this.mapDbToModel(data);
      })
    );
  }

  getVeiculosByCliente(clienteId: number): Observable<Veiculo[]> {
    return from(this.supabase.from('veiculos').select('*, clientes(nome)').eq('cliente_id', clienteId).order('id', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(v => this.mapDbToModel(v));
      })
    );
  }

  addVeiculo(veiculo: Omit<Veiculo, 'id'>): Observable<Veiculo> {
    const dbData = this.mapModelToDb(veiculo);
    return from(this.supabase.from('veiculos').insert([dbData]).select().single()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapDbToModel(data);
      })
    );
  }

  updateVeiculo(id: number, veiculo: Partial<Veiculo>): Observable<Veiculo> {
    const dbData = this.mapModelToDb(veiculo);
    return from(this.supabase.from('veiculos').update(dbData).eq('id', id).select().single()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapDbToModel(data);
      })
    );
  }

  deleteVeiculo(id: number): Observable<any> {
    return from(this.supabase.from('veiculos').delete().eq('id', id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  getTotal(): Observable<number> {
    return from(this.supabase.from('veiculos').select('*', { count: 'exact', head: true })).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return count || 0;
      })
    );
  }

  private mapDbToModel(dbVeiculo: any): Veiculo {
    return {
      id: dbVeiculo.id,
      clienteId: dbVeiculo.cliente_id,
      clienteNome: dbVeiculo.clientes?.nome,
      marca: dbVeiculo.marca,
      modelo: dbVeiculo.modelo,
      ano: dbVeiculo.ano,
      placa: dbVeiculo.placa,
      cor: dbVeiculo.cor,
      quilometragem: dbVeiculo.km_atual
    };
  }

  private mapModelToDb(veiculo: Partial<Veiculo>): any {
    const dbData: any = { ...veiculo };
    if (veiculo.clienteId !== undefined) {
      dbData.cliente_id = veiculo.clienteId;
      delete dbData.clienteId;
    }
    if (veiculo.quilometragem !== undefined) {
      dbData.km_atual = veiculo.quilometragem;
      delete dbData.quilometragem;
    }
    delete dbData.clienteNome;
    return dbData;
  }
}
