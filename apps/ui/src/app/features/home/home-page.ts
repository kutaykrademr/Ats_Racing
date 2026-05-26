import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PagePlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-placeholder
      eyebrow="Ats Racing"
      title="Anasayfa"
      lead="Hero, hizmetler, portfolyo ve daha fazlası feat/ui-home dalında inşa edilecek."
    ></app-page-placeholder>
  `,
})
export default class HomePage {}
