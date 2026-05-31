import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type RegStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: string;
  email: string;
  role: 'user' | 'dealer' | 'admin';
  fullName: string;
  phone?: string | null;
  dealershipName?: string | null;
  status: RegStatus;
  rejectionReason?: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;

  // Bearer token is attached automatically by authInterceptor.

  listRegistrations(status?: RegStatus): Promise<Registration[]> {
    const params = status ? `?status=${status}` : '';
    return firstValueFrom(
      this.http.get<Registration[]>(`${this.api}/admin/registrations${params}`),
    );
  }

  approve(id: string): Promise<Registration> {
    return firstValueFrom(
      this.http.post<Registration>(`${this.api}/admin/registrations/${id}/approve`, {}),
    );
  }

  reject(id: string, reason: string): Promise<Registration> {
    return firstValueFrom(
      this.http.post<Registration>(`${this.api}/admin/registrations/${id}/reject`, { reason }),
    );
  }
}
