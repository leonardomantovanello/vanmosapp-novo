export type ChatMessageType = 'TEXTO' | 'AUDIO' | 'ARQUIVO';

export interface ChatMessage {
  id: string;
  text: string | null;
  mine: boolean;
  createdAt: string;
  tipo: ChatMessageType;
  // Data URI (ex.: "data:image/jpeg;base64,...") pronta pra uso direto em
  // <Image>/<AudioPlayer> — sem storage externo configurado no projeto, o
  // anexo já chega assim da API (ver messageService.ts).
  attachmentUri: string | null;
  attachmentName: string | null;
}
