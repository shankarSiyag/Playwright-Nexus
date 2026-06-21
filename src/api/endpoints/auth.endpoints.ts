import { ApiClient } from '../clients/api-client';

export interface LoginResponse {
  token: string;
}

export class AuthEndpoints {
  constructor(private readonly client: ApiClient) {}

  async login(email: string, password: string) {
    const res = await this.client.post('/api/login', { email, password });
    console.log('AuthClient Layer Called for Login')
    return res;
  }

  async loginAndGetToken(email: string, password: string): Promise<string> {
    const res = await this.login(email, password);
    if (!res.ok()) {
      throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
    }
    const body = (await res.json()) as LoginResponse;
    return body.token;
  }

  async register(email: string, password: string) {
    return this.client.post('/register', { email, password });
  }
}
