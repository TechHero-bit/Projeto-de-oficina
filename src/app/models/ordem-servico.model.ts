export type StatusOS = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export interface ServicoItem {
  descricao: string;
  valor: number;
}

export interface OrdemServico {
  id: number;
  clienteId: number;
  clienteNome?: string;
  veiculoId: number;
  veiculoInfo?: string;
  descricaoProblema: string;
  servicos: ServicoItem[];
  status: StatusOS;
  dataAbertura: Date;
  dataConclusao?: Date;
  observacoes: string;
  valorTotal: number;
}
