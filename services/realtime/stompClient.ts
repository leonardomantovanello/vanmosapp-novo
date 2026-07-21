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

  client = new Client({
    brokerURL: toWebSocketUrl(API_BASE_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
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
    stompSub = activeClient.subscribe(destination, (message: IMessage) => {
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
  if (!client?.connected) return;
  client.publish({ destination, body: JSON.stringify(body) });
}
