import { Injectable, Logger } from '@nestjs/common';

interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location?: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

@Injectable()
export class BrasilApiProvider {
  private readonly logger = new Logger(BrasilApiProvider.name);
  private readonly baseUrl = 'https://brasilapi.com.br/api';

  /**
   * Lookup CEP (postal code) via BrasilAPI.
   * Returns address information or null if not found.
   */
  async lookupCep(cep: string): Promise<BrasilApiCepResponse | null> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      this.logger.warn(`[BRASIL-API] Invalid CEP format: ${cep}`);
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/cep/v1/${cleanCep}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 404) {
        this.logger.warn(`[BRASIL-API] CEP not found: ${cleanCep}`);
        return null;
      }

      if (!response.ok) {
        this.logger.error(`[BRASIL-API] CEP lookup failed: ${response.status}`);
        return null;
      }

      const data = await response.json() as BrasilApiCepResponse;
      this.logger.log(`[BRASIL-API] CEP ${cleanCep} found: ${data.street}, ${data.city}/${data.state}`);
      return data;
    } catch (error) {
      this.logger.error(`[BRASIL-API] Error looking up CEP: ${error}`);
      return null;
    }
  }

  /**
   * Validate CPF format (not full validation with check digits).
   */
  validateCpfFormat(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, '');
    return clean.length === 11;
  }

  /**
   * Validate CNPJ format.
   */
  validateCnpjFormat(cnpj: string): boolean {
    const clean = cnpj.replace(/\D/g, '');
    return clean.length === 14;
  }
}
