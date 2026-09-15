// Extensão -> MIME type, só o suficiente pra decidir como uma bolha de
// anexo é exibida (thumbnail de imagem vs. card de arquivo genérico) e pra
// montar a data URI enviada ao backend (mesmo padrão de avatar/documentos —
// ver AvatarPicker.tsx e profileService.ts, que já guardam data URIs
// inteiras na coluna do banco).
const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

const AUDIO_MIME_BY_EXTENSION: Record<string, string> = {
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'audio/webm',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
};

function extensionOf(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : '';
}

export function guessMimeType(filename: string): string {
  const ext = extensionOf(filename);
  return IMAGE_MIME_BY_EXTENSION[ext] ?? AUDIO_MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}

export function isImageFile(filename: string | null | undefined): boolean {
  if (!filename) return false;
  return extensionOf(filename) in IMAGE_MIME_BY_EXTENSION;
}
