export interface Veiculo {
  id: number;
  clienteId: number;
  clienteNome?: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  quilometragem: number;
}
