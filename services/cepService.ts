import { onlyDigits } from '@/utils/format';

export interface CepAddress {
  logradouro: string;
  bairro: string;
  localidade: string;
}

export type CepLookupResult =
  | { status: 'success'; data: CepAddress }
  | { status: 'not_found' }
  | { status: 'invalid' }
  | { status: 'timeout' }
  | { status: 'network_error' };

const DEFAULT_TIMEOUT_MS = 8000;

// Mock/adapter isolado para facilitar a troca futura por um backend próprio.
export async function lookupCep(cep: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<CepLookupResult> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) {
    return { status: 'invalid' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return { status: 'network_error' };
    }

    const data = await response.json();
    if (data.erro) {
      return { status: 'not_found' };
    }

    return {
      status: 'success',
      data: {
        logradouro: data.logradouro ?? '',
        bairro: data.bairro ?? '',
        localidade: data.localidade ?? '',
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'timeout' };
    }
    return { status: 'network_error' };
  } finally {
    clearTimeout(timeoutId);
  }
}
