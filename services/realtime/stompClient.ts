import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

import { API_BASE_URL } from '@/services/api/client';

// Deriva a URL do WebSocket a partir da mesma API_BASE_URL usada pelo REST
// (http(s)://host/api -> ws(s)://host/ws/websocket). "/ws/websocket" é o
// endpoint raw que o SockJS do Spring expõe por baixo do "/ws" registrado
// em WebSocketConfig — usamos ele direto porque o React Native já tem
// WebSocket nativo e não precisa do protocolo de fallback do SockJS
// (que depende de APIs de browser inexistentes no RN).
function toWebSocketUrl(apiBaseUrl: string): string {
  const withoutApiSuffix = apiBaseUrl.replace(/\/api\/?$/, '');
  const wsBase = withoutApiSuffix.replace(/^http/, 'ws');
  return `${wsBase}/ws/websocket`;
}

type Unsubscribe = () => void;

let client: Client | null = null;

/**
 * Abre (ou reaproveita) a conexão STOMP para o usuário logado. Chamado pelo
 * SessionContext ao restaurar/entrar numa sessão. O token só é revalidado a
 * cada (re)conexão — não há renovação dentro de uma conexão já aberta, o
 * que é suficiente para o tempo de uma corrida (ver plano/limitações).
 */
export function connectRealtime(token: string): void {
  if (client) {
    client.connectHeaders = { Authorization: `Bearer ${token}` };
    if (!client.active) client.activate();
    return;
  }

  const wsUrl = toWebSocketUrl(API_BASE_URL);
  client = new Client({
    // webSocketFactory (em vez de brokerURL) força o uso do WebSocket nativo
    // do React Native. @stomp/stompjs tenta detectar sozinho se está rodando
    // em browser ou Node.js quando só recebe brokerURL, e o RN também expõe
    // um global "process" (como o Node), o que pode confundir essa detecção
    // e fazer a lib tentar um caminho incompatível com o ambiente RN.
    webSocketFactory: () => {
      console.log('[stomp] factory chamada, criando WebSocket nativo para', wsUrl);
      const socket = new WebSocket(wsUrl);
      console.log('[stomp] WebSocket criado, readyState=', socket.readyState);
      // addEventListener (não .onopen=) para não ser sobrescrito pelos
      // handlers que o próprio @stomp/stompjs registra em seguida no mesmo
      // objeto — isso é só diagnóstico temporário.
      socket.addEventListener('open', () => console.log('[stomp] socket nativo: open'));
      socket.addEventListener('error', (e: any) => console.log('[stomp] socket nativo: error', JSON.stringify(e?.message ?? e)));
      socket.addEventListener('close', (e: any) => console.log('[stomp] socket nativo: close', e?.code, e?.reason));
      return socket;
    },
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
  console.log('[stomp] conectando em', wsUrl);
  client.onConnect = () => console.log('[stomp] conectado');
  client.onStompError = (frame) => console.log('[stomp] erro STOMP:', frame.headers['message'], frame.body);
  client.onWebSocketError = (event) => console.log('[stomp] erro WebSocket:', event);
  client.onWebSocketClose = (event) => console.log('[stomp] WebSocket fechado:', event.code, event.reason);
  client.activate();
}

export function disconnectRealtime(): void {
  const current = client;
  client = null;
  void current?.deactivate();
}

/**
 * Assina um tópico STOMP (ex: /topic/mensagens/aluno/5). Se a conexão ainda
 * não estiver pronta, a inscrição é feita assim que ela conectar — e
 * automaticamente refeita a cada reconexão, já que client.onConnect
 * dispara de novo depois de qualquer queda de rede.
 */
export function subscribeTopic<T>(destination: string, onMessage: (payload: T) => void): Unsubscribe {
  if (!client) return () => {};
  const activeClient = client;

  let stompSub: StompSubscription | null = null;
  let cancelled = false;

  const doSubscribe = () => {
    if (cancelled) return;
    console.log('[stomp] assinando', destination);
    stompSub = activeClient.subscribe(destination, (message: IMessage) => {
      console.log('[stomp] mensagem recebida em', destination, message.body);
      try {
        onMessage(JSON.parse(message.body) as T);
      } catch {
        // corpo não era JSON válido — ignora silenciosamente
      }
    });
  };

  if (activeClient.connected) {
    doSubscribe();
  } else {
    const previousOnConnect = activeClient.onConnect;
    activeClient.onConnect = (frame) => {
      previousOnConnect?.(frame);
      doSubscribe();
    };
  }

  return () => {
    cancelled = true;
    stompSub?.unsubscribe();
  };
}

/** Publica em um destino de aplicação (ex: /app/localizacao). Sem efeito se ainda não houver conexão ativa. */
export function publish(destination: string, body: unknown): void {
  if (!client?.connected) {
    console.log('[stomp] publish ignorado (sem conexão):', destination);
    return;
  }
  client.publish({ destination, body: JSON.stringify(body) });
  console.log('[stomp] publicado em', destination, body);
}
