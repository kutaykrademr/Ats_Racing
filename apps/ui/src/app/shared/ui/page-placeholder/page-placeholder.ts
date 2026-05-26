import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="placeholder">
      <div class="container-page text-center">
        <p class="eyebrow">{{ eyebrow() }}</p>
        <h1>{{ title() }}</h1>
        <p class="lead">{{ lead() }}</p>
      </div>
    </section>
  `,
  styles: [
    `
      .placeholder {
        background: #0d0c0f;
        color: #ffffff;
        padding-block: 12rem 8rem;
      }

      .eyebrow {
        font-family: 'DM Sans', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #ea0a0b;
        font-size: 0.8125rem;
        margin: 0 0 1rem;
      }

      h1 {
        color: #ffffff;
      }

      .lead {
        margin: 1.25rem auto 0;
        max-width: 36rem;
        color: rgba(255, 255, 255, 0.7);
      }
    `,
  ],
})
export class PagePlaceholder {
  readonly eyebrow = input('Ats Racing');
  readonly title = input('Yakında');
  readonly lead = input('Bu sayfa kendi PR’ında detaylı olarak geliştirilecek.');
}
