// POST /api/login — unified login (checks passageiros then motorista
// internally, see LoginController on the backend). Unlike almost every
// other endpoint in this API, this one does NOT use the
// { sucesso, mensagem, dados } ApiEnvelope — accessToken/refreshToken/usuario
// are top-level fields. See LoginController.login() on the backend.
export interface CadastroLoginResponse {
  sucesso: boolean;
  mensagem: string;
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    // Discrimina MOTORISTA (tabela motorista) vs PASSAGEIRO (tabela
    // passageiros) — authService.ts usa isto pra decidir a role real, em vez
    // de confiar em qual botão o usuário apertou na tela de login (que não
    // tem como saber o tipo da conta antes de logar).
    tipo: 'MOTORISTA' | 'PASSAGEIRO';
  };
}
