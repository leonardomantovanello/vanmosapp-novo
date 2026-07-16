export interface RouteStop {
  id: string;
  nome: string;
  cep: string;
  bairro: string;
  cidade: string;
  numero: string;
  referencia: string;
  parada: string;
}

export type RouteStopInput = Omit<RouteStop, 'id'>;
