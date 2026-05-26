import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [PagePlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-placeholder
      eyebrow="Hikayemiz"
      title="Hakkımızda"
      lead="feat/ui-about dalında hikaye, ekip ve değerler işlenecek."
    ></app-page-placeholder>
  `,
})
export default class AboutPage {}
