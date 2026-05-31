import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  AccountStatus,
  ProfileRow,
  RegistrationView,
  toRegistrationView,
} from '../auth/auth.types';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /** List registrations, optionally filtered by status (newest first). */
  async listRegistrations(status?: AccountStatus): Promise<RegistrationView[]> {
    let query = this.supabase.admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.returns<ProfileRow[]>();
    if (error) {
      this.logger.error(`listRegistrations failed: ${error.message}`);
      throw new InternalServerErrorException('Kayıtlar getirilemedi.');
    }
    return (data ?? []).map(toRegistrationView);
  }

  async approve(id: string, adminId: string): Promise<RegistrationView> {
    return this.setStatus(id, adminId, 'approved', null);
  }

  async reject(
    id: string,
    adminId: string,
    reason: string,
  ): Promise<RegistrationView> {
    return this.setStatus(id, adminId, 'rejected', reason);
  }

  private async setStatus(
    id: string,
    adminId: string,
    status: AccountStatus,
    rejectionReason: string | null,
  ): Promise<RegistrationView> {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .update({
        status,
        rejection_reason: rejectionReason,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single<ProfileRow>();

    if (error) {
      this.logger.error(`setStatus(${status}) failed for ${id}: ${error.message}`);
      throw new InternalServerErrorException('Durum güncellenemedi.');
    }
    if (!data) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }
    return toRegistrationView(data);
  }
}
