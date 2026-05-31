import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

/**
 * Provides two Supabase clients:
 *  - `anon`  : public/anon key. Used for user-context auth calls
 *              (signUp, signInWithPassword). Respects RLS.
 *  - `admin` : service-role key. Bypasses RLS. Used for trusted
 *              server-side operations (reading any profile, approving
 *              registrations, admin user management). NEVER exposed to
 *              the browser.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  private _anon: SupabaseClient | null = null;
  private _admin: SupabaseClient | null = null;
  private _url = '';
  private _anonKey = '';

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.get<string>('SUPABASE_URL');
    const anonKey = this.config.get<string>('SUPABASE_ANON_KEY');
    const serviceKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !anonKey) {
      this.logger.warn(
        'SUPABASE_URL / SUPABASE_ANON_KEY not set — auth is disabled. Set them in .env.',
      );
    } else {
      this._url = url;
      this._anonKey = anonKey;
      this._anon = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }

    if (!url || !serviceKey) {
      this.logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY not set — admin operations are disabled. ' +
          'Paste the service_role key into .env to enable approval/admin endpoints.',
      );
    } else {
      this._admin = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
  }

  /** Anon-key client (user-context auth). Throws if not configured. */
  get anon(): SupabaseClient {
    if (!this._anon) {
      throw new Error('Supabase anon client is not configured (check .env).');
    }
    return this._anon;
  }

  /** Service-role client (bypasses RLS). Throws if not configured. */
  get admin(): SupabaseClient {
    if (!this._admin) {
      throw new Error(
        'Supabase admin client is not configured (set SUPABASE_SERVICE_ROLE_KEY in .env).',
      );
    }
    return this._admin;
  }

  /**
   * Creates a one-off client scoped to a user's JWT.
   * Uses the anon key + Authorization header so RLS resolves as that user.
   * No service-role key required — works as long as the anon client is configured.
   */
  clientFor(accessToken: string): SupabaseClient {
    return createClient(this._url, this._anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  get isAnonReady(): boolean {
    return !!this._anon;
  }

  get isAdminReady(): boolean {
    return !!this._admin;
  }
}
