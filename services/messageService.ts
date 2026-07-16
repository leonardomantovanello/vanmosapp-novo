import { authorizedRequest } from '@/services/api/client';
import type { MensagemDTO } from '@/types/api';
import type { ChatMessage } from '@/types';

// Persisted server-side now (GET/POST /api/mensagens/aluno/{alunoId}) —
// before this was MOCK_MESSAGES, an in-memory object that reset every time
// the app restarted. One conversation per aluno, shared by that aluno's
// motorista and responsavel (backend enforces this — see MensagemController).
//
// currentUserId is the logged-in Passageiro id (session.user.id): messages
// don't carry an isMine flag from the backend, so "mine" is derived here by
// comparing remetenteId against whoever is currently logged in.
function toChatMessage(mensagem: MensagemDTO, currentUserId: number): ChatMessage {
  return {
    id: String(mensagem.id),
    text: mensagem.texto,
    mine: mensagem.remetenteId === currentUserId,
    createdAt: mensagem.criadoEm,
  };
}

export async function getMessages(alunoId: number, currentUserId: number): Promise<ChatMessage[]> {
  const mensagens = await authorizedRequest<MensagemDTO[]>(`/mensagens/aluno/${alunoId}`);
  return mensagens.map((mensagem) => toChatMessage(mensagem, currentUserId));
}

export async function sendMessage(alunoId: number, currentUserId: number, text: string): Promise<ChatMessage> {
  const mensagem = await authorizedRequest<MensagemDTO>(`/mensagens/aluno/${alunoId}`, {
    method: 'POST',
    body: { texto: text },
  });
  return toChatMessage(mensagem, currentUserId);
}
