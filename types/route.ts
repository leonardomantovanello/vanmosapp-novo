// Mirrors dto/RotaParadaDTO.java. Cada parada é um aluno já cadastrado —
// não existe mais entrada livre de CEP/endereço aqui, o endereço vem sempre
// do cadastro do aluno (ver GET/POST /api/rotas no backend).
export interface RouteStop {
  id: string;
  alunoId: string;
  nome: string;
  enderecoEmbarque: string | null;
  enderecoDesembarque: string | null;
  escola: string | null;
  turno: string | null;
  ordem: number;
}
