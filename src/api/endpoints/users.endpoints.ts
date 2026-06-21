import { ApiClient } from '../clients/api-client';
import { UserResponse } from '../model/user.model';

export class UsersEndpoints {
  constructor(private readonly client: ApiClient) { }

  async getUser(id: number) {
    return this.client.get(`/api/users/${id}`);
  }

  async listUsers(page = 1) {
    return this.client.get('/api/users', { page: String(page) });
  }

  async createUser(name: string, job: string) {
    return this.client.post('/api/users', { name, job });
  }

  async updateUser(id: number, name: string, job: string) {
    return this.client.put(`/api/users/${id}`, { name, job });
  }

  async deleteUser(id: number) {
    return this.client.delete(`/api/users/${id}`);
  }
}
