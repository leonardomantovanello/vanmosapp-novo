# Vanmos

Aplicativo mobile (Expo/React Native) para gestão de transporte escolar/van, com fluxos
separados para **passageiro** e **motorista**: login, home, perfil, chat, notificações e
edição de rota. O visual segue um tema escuro com gradiente roxo/rosa.

O cadastro de usuários (e o cadastro de alunos pelo motorista) acontece no site — o app
foca apenas no uso do serviço por quem já tem conta.

> Estado atual: conectado à API real (Spring Boot, `vanmosapi`) — autenticação por JWT,
> alunos, faltas, rota/progresso da corrida, perfil, mensagens em tempo real (STOMP) e
> ajustes já vêm do backend. Só `services/notificationService.ts` ainda não tem um
> endpoint real por trás (retorna lista vazia) — veja [Limitações atuais](#limitações-atuais).

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
context/                  SessionContext: sessão do usuário persistida via SecureStore
                          (token JWT, papel, logout)
services/                 Camada de acesso à API real (vanmosapi) — auth, alunos, faltas,
                          rota/progresso, perfil, mensagens (STOMP), ajustes, consulta de
                          CEP. Só notificationService.ts ainda não tem endpoint real (ver
                          Limitações atuais).
types/                    Tipos compartilhados (User, RouteStop, ChatMessage,
                          AppNotification, Attendance)
utils/                    Validação, máscara (CEP/telefone/CNH) e formatação
```

## Limitações atuais

- **Notificações**: `services/notificationService.ts` retorna lista vazia — o backend
  (`vanmosapi`) ainda não expõe um endpoint de notificações. A tela (`app/notifications.tsx`)
  já trata isso com um estado vazio, sem dado inventado.
- **Cadastro de contas**: acontece fora do app (no site) — o app foca apenas no uso do
  serviço por quem já tem conta.
- Botões de funcionalidades ainda não implementadas (ex.: login social, anexar
  arquivo/emoji/câmera no chat, abas "Horários"/"Locais") exibem um aviso de
  "Funcionalidade em desenvolvimento" em vez de ficar sem resposta.
- Não há suíte de testes automatizados configurada no projeto (sem `jest`/`jest-expo`
  instalado). As funções de `utils/validation.ts` e `utils/masks.ts` são puras e foram
  escritas para serem facilmente testáveis assim que um test runner for adicionado.

## Próximos passos sugeridos

- Adicionar um endpoint real de notificações no backend e trocar
  `services/notificationService.ts` pra consumi-lo.
- Adicionar um test runner (ex.: `jest-expo`) e cobrir `utils/` e componentes críticos.
