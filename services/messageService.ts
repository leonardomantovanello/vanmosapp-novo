import { authorizedRequest } from '@/services/api/client';
import type { MensagemDTO } from '@/types/api';
import type { ChatMessage, ChatMessageType } from '@/types';

// Persisted server-side now (GET/POST /api/mensagens/aluno/{alunoId}) —
// before this was MOCK_MESSAGES, an in-memory object that reset every time
// the app restarted. One conversation per aluno, shared by that aluno's
// motorista and responsavel (backend enforces this — see MensagemController).
//
// currentUserId is the logged-in Passageiro id (session.user.id): messages
// don't carry an isMine flag from the backend, so "mine" is derived here by
// comparing remetenteId against whoever is currently logged in.
export function toChatMessage(mensagem: MensagemDTO, currentUserId: number): ChatMessage {
  return {
    id: String(mensagem.id),
    text: mensagem.texto,
    mine: mensagem.remetenteId === currentUserId,
    createdAt: mensagem.criadoEm,
    // Coalesce pra 'TEXTO': se o backend ainda não rodou a migration V21,
    // essas mensagens antigas nem têm o campo "tipo" no JSON (undefined,
    // não 'TEXTO') — sem isso, MessageBubble tratava "não é TEXTO" como
    // verdadeiro e duplicava o texto na tela.
    tipo: mensagem.tipo ?? 'TEXTO',
    attachmentUri: mensagem.anexoBase64 ?? null,
    attachmentName: mensagem.anexoNome ?? null,
  };
}

export async function getMessages(alunoId: number, currentUserId: number): Promise<ChatMessage[]> {
  const mensagens = await authorizedRequest<MensagemDTO[]>(`/mensagens/aluno/${alunoId}`);
  return mensagens.map((mensagem) => toChatMessage(mensagem, currentUserId));
}

export interface SendMessageInput {
  texto?: string;
  tipo?: ChatMessageType;
  // Data URI completa (ex.: "data:audio/mp4;base64,...") — ver
  // utils/attachments.ts, que já devolve nesse formato.
  anexoBase64?: string;
  anexoNome?: string;
}

export async function sendMessage(alunoId: number, currentUserId: number, input: string | SendMessageInput): Promise<ChatMessage> {
  const body: SendMessageInput = typeof input === 'string' ? { texto: input, tipo: 'TEXTO' } : input;
  const mensagem = await authorizedRequest<MensagemDTO>(`/mensagens/aluno/${alunoId}`, {
    method: 'POST',
    body,
  });
  return toChatMessage(mensagem, currentUserId);
}
