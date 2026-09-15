import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { guessMimeType } from '@/utils/mime';

// Mesmo teto aplicado no site (Register.jsx, upload de RG/CNH) e validado de
// novo no backend (MensagemService.enviar) — sem storage externo
// configurado, o anexo vira base64 direto numa coluna NVARCHAR(MAX), então
// vale manter os arquivos pequenos.
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export class AttachmentTooLargeError extends Error {
  constructor() {
    super('O arquivo é muito grande. O limite é de 5MB.');
    this.name = 'AttachmentTooLargeError';
  }
}

// Base64 infla ~33% o tamanho original — checar o tamanho da data URI já
// pronta (em vez do arquivo cru) cobre uniformemente os dois casos: quando
// já recebemos a data URI pronta (ex.: câmera) e quando lemos de um arquivo.
const MAX_DATA_URI_LENGTH = Math.ceil(MAX_ATTACHMENT_SIZE_BYTES * 1.4);

/**
 * Lê uma URI local (file://, content://, blob:) e devolve uma data URI
 * pronta pra enviar ao backend e pra exibir depois (Image/AudioPlayer já
 * aceitam data URI direto, mesmo padrão do avatar). No web, pickers
 * devolvem URIs blob: que não passam pelo FileSystem nativo, então lê via
 * fetch+FileReader; fora do web, usa FileSystem.readAsStringAsync.
 */
export async function readUriAsDataUri(uri: string, filename: string, mimeTypeHint?: string): Promise<string> {
  if (uri.startsWith('data:')) {
    if (uri.length > MAX_DATA_URI_LENGTH) throw new AttachmentTooLargeError();
    return uri;
  }

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    if (blob.size > MAX_ATTACHMENT_SIZE_BYTES) throw new AttachmentTooLargeError();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error('Não foi possível ler o arquivo.'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists && !info.isDirectory && info.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new AttachmentTooLargeError();
  }

  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  const mimeType = mimeTypeHint || guessMimeType(filename);
  return `data:${mimeType};base64,${base64}`;
}
