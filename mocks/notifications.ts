import type { AppNotification } from '@/types';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: '1', message: 'Seu motorista chegou', date: '14/07', read: false },
  { id: '2', message: 'Seu motorista está quase chegando', date: '14/07', read: false },
  { id: '3', message: 'Você foi adicionado em uma turma', date: '14/07', read: false },
  { id: '4', message: 'Nova mensagem', date: '14/07', read: false },
  { id: '5', message: 'Horário determinado', date: '14/07', read: false },
  { id: '6', message: 'Novo contato', date: '14/07', read: true },
  { id: '7', message: 'Novo contato', date: '14/07', read: true },
];
