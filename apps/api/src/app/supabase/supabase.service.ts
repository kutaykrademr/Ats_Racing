import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  readonly client: SupabaseClient | null;

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const key =
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ??
      config.get<string>('SUPABASE_ANON_KEY');

    if (!url || !key) {
      this.logger.warn(
        'SUPABASE_URL / SUPABASE_*_KEY not set — Supabase client is disabled. Set them in .env to enable.',
      );
      this.client = null;
      return;
    }

    this.client = createClient(url, key);
  }
}
