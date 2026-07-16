# Vanmos

Aplicativo mobile (Expo/React Native) para gestão de transporte escolar/van, com fluxos
separados para **passageiro** e **motorista**: login, home, perfil, chat, notificações e
edição de rota. O visual segue um tema escuro com gradiente roxo/rosa.

O cadastro de usuários (e o cadastro de alunos pelo motorista) acontece no site — o app
foca apenas no uso do serviço por quem já tem conta.

> Estado atual: protótipo funcional com dados **mockados** (em memória). Não há backend
> nem autenticação real — veja [Limitações atuais](#limitações-atuais).

## Requisitos

- Node.js 20 LTS ou superior
- npm 10+
- Expo CLI (via `npx`, não precisa instalar globalmente)
- Para rodar em dispositivo físico: app [Expo Go](https://expo.dev/go)
- Para emuladores: Android Studio (emulador Android) e/ou Xcode (simulador iOS, apenas macOS)

## Instalação

```bash
npm install
```

## Comandos

```bash
npm start        # inicia o servidor de desenvolvimento (Expo)
npm run android   # abre no emulador/dispositivo Android
npm run ios       # abre no simulador iOS (macOS)
npm run web       # abre a versão web
npm run lint      # roda o ESLint (expo lint)
npx tsc --noEmit  # verifica os tipos TypeScript
```

## Estrutura do projeto

```
app/                     Telas (Expo Router / file-based routing)
  index.tsx              Seleção de papel (passageiro/motorista) antes do login
  login.tsx               Login
  passenger-home.tsx       Home do passageiro (motorista, presença, calendário)
  driver-home.tsx          Home do motorista (passageiros, corrida)
  profile.tsx              Perfil do usuário
  chat.tsx                 Conversa com motorista/passageiro
  notifications.tsx        Lista de notificações
  edit-route.tsx           Pontos de parada da rota

components/
  ui/                     Componentes de interface genéricos e reutilizáveis
                          (Button, TextField, Screen, Header, Avatar, EmptyState, ModalSheet)
  features/               Componentes específicos de um domínio (profile,
                          home, calendar, chat, route)

constants/                Tema único: cores, espaçamentos, tipografia e strings
                          compartilhadas (theme.ts agrega tudo)
context/                  SessionContext: sessão do usuário em memória (nome, papel, logout)
services/                 Camada de acesso a dados mockada (perfil, rotas, mensagens,
                          notificações, consulta de CEP) — isolada das telas para
                          facilitar a troca futura por chamadas de API reais
mocks/                    Dados temporários usados pelos services
types/                    Tipos compartilhados (User, RouteStop, ChatMessage,
                          AppNotification, Attendance)
utils/                    Validação, máscara (CEP/telefone/CNH) e formatação
```

## Limitações atuais

- **Sem backend real**: todos os dados (perfil, rotas, mensagens, notificações) vivem em
  memória através da camada `services/` e são perdidos ao reiniciar o app.
- **Sem autenticação real**: o login apenas valida o formulário e abre uma sessão local
  (`context/SessionContext.tsx`); nenhuma senha é persistida ou enviada a um servidor.
  O cadastro de contas acontece fora do app (no site).
- **Consulta de CEP real**: `services/cepService.ts` consulta a API pública do ViaCEP
  (único acesso de rede do app) e trata falha de rede, timeout e CEP não encontrado.
- Botões de funcionalidades ainda não implementadas (ex.: login social, iniciar corrida,
  anexar arquivo no chat, abas "Horários"/"Locais") exibem um aviso de
  "Funcionalidade em desenvolvimento" em vez de ficar sem resposta.
- Não há suíte de testes automatizados configurada no projeto (sem `jest`/`jest-expo`
  instalado). As funções de `utils/validation.ts` e `utils/masks.ts` são puras e foram
  escritas para serem facilmente testáveis assim que um test runner for adicionado.

## Próximos passos sugeridos (integração futura)

- Substituir as funções de `services/*` por chamadas HTTP a uma API real, mantendo as
  mesmas assinaturas usadas pelas telas.
- Adicionar persistência de sessão (ex.: `expo-secure-store`) e autenticação real.
- Adicionar um test runner (ex.: `jest-expo`) e cobrir `utils/` e componentes críticos.
