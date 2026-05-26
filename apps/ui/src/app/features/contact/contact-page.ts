import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { ContactForm } from './sections/contact-form';
import { ContactInfo } from './sections/contact-info';
import { ContactMap } from './sections/contact-map';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [PageHero, ContactForm, ContactInfo, ContactMap],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      eyebrow="İletişim"
      title="Bize Ulaşın"
      lead="Sorularını, projelerini ya da randevu taleplerini bize iletmek için bir kaç saniye yeterli."
      image="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=2400&q=80"
    ></app-page-hero>

    <section class="section">
      <div class="container-page contact-grid">
        <app-contact-form class="contact-grid__form"></app-contact-form>
        <app-contact-info class="contact-grid__info"></app-contact-info>
      </div>
    </section>

    <app-contact-map></app-contact-map>
  `,
  styles: [
    `
      .contact-grid {
        display: grid;
        gap: 2rem;
        align-items: stretch;
      }
      @media (min-width: 1024px) {
        .contact-grid {
          grid-template-columns: 1.4fr 1fr;
          gap: 3rem;
        }
      }
      .contact-grid__form,
      .contact-grid__info {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export default class ContactPage {}
