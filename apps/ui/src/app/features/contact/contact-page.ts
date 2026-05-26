import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [PagePlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-placeholder
      eyebrow="İletişim"
      title="Bize Ulaşın"
      lead="feat/ui-contact dalında form, harita ve iletişim detayları yer alacak."
    ></app-page-placeholder>
  `,
})
export default class ContactPage {}
