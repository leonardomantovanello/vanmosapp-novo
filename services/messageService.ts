import { MOCK_MESSAGES } from '@/mocks/messages';
import type { ChatMessage } from '@/types';

// Repositório mockado em memória, isolado da tela para facilitar a troca
// futura por um cliente de API/WebSocket real.
export async function getMessages(contactName: string): Promise<ChatMessage[]> {
  return MOCK_MESSAGES[contactName] ?? [];
}

export async function sendMessage(contactName: string, text: string): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: Date.now().toString(),
    text,
    mine: true,
    createdAt: new Date().toISOString(),
  };
  const existing = MOCK_MESSAGES[contactName] ?? [];
  MOCK_MESSAGES[contactName] = [...existing, message];
  return message;
}
