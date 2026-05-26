import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [PagePlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-placeholder
      eyebrow="Ürünler"
      title="Shop"
      lead="feat/ui-shop dalında ürün listesi, filtreler ve sayfalama gelecek."
    ></app-page-placeholder>
  `,
})
export default class ShopPage {}
