// Strings compartilhadas entre telas. Textos específicos de uma única tela
// permanecem no próprio arquivo da tela para facilitar a leitura.
export const commonStrings = {
  actions: {
    save: 'Salvar',
    cancel: 'Cancelar',
    back: 'Voltar',
    add: 'Adicionar',
    login: 'Entrar',
    logout: 'Sair',
    myProfile: 'Meu perfil',
    settings: 'Configurações',
    changePassword: 'Alterar senha',
    seeAllDays: 'Ver todos os dias',
  },
  feedback: {
    featureInDevelopment: 'Funcionalidade em desenvolvimento.',
    genericError: 'Não foi possível concluir a ação. Tente novamente.',
    savedSuccessfully: 'Alterações salvas com sucesso.',
    loading: 'Carregando...',
  },
  validation: {
    invalidEmail: 'Informe um e-mail válido.',
    minLengthPassword: 'A senha deve ter pelo menos 6 caracteres.',
    invalidCep: 'O CEP deve ter 8 dígitos.',
    requiredField: 'Preencha todos os campos obrigatórios.',
  },
  cep: {
    searching: 'Buscando endereço...',
    notFound: 'CEP não encontrado.',
    invalid: 'CEP inválido. Verifique os números digitados.',
    timeout: 'A busca demorou demais. Verifique sua conexão e tente novamente.',
    networkError: 'Não foi possível consultar o CEP. Verifique sua conexão.',
  },
} as const;
