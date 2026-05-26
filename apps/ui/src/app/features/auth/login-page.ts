import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [PagePlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-placeholder
      eyebrow="Hesabım"
      title="Giriş Yap"
      lead="feat/ui-login dalında reactive form ve Supabase auth entegrasyonu gelecek."
    ></app-page-placeholder>
  `,
})
export default class LoginPage {}
