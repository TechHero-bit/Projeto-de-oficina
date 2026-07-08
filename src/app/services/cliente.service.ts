import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private supabase = inject(SupabaseService).client;

  getClientes(): Observable<Cliente[]> {
    return from(this.supabase.from('clientes').select('*').order('id', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(c => ({
          ...c,
          dataCadastro: c.data_criacao || c.criado_em ? new Date(c.data_criacao || c.criado_em) : undefined
        }));
      })
    );
  }

  getClienteById(id: number): Observable<Cliente | undefined> {
    return from(this.supabase.from('clientes').select('*').eq('id', id).single()).pipe(
      map(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error; // ignore no rows
        if (!data) return undefined;
        return {
          ...data,
          dataCadastro: data.data_criacao || data.criado_em ? new Date(data.data_criacao || data.criado_em) : undefined
        } as Cliente;
      })
    );
  }

  addCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Observable<Cliente> {
    return from(this.supabase.from('clientes').insert([cliente]).select().single()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return {
          ...data,
          dataCadastro: data.data_criacao || data.criado_em ? new Date(data.data_criacao || data.criado_em) : undefined
        } as Cliente;
      })
    );
  }

  updateCliente(id: number, data: Partial<Cliente>): Observable<any> {
    return from(this.supabase.from('clientes').update(data).eq('id', id).select().single()).pipe(
      map(({ data: updatedData, error }) => {
        if (error) throw error;
        return updatedData;
      })
    );
  }

  deleteCliente(id: number): Observable<any> {
    return from(this.supabase.from('clientes').delete().eq('id', id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  getTotal(): Observable<number> {
    return from(this.supabase.from('clientes').select('*', { count: 'exact', head: true })).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return count || 0;
      })
    );
  }
}
