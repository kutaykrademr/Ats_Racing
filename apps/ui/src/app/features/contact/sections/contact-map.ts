import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="map-band">
      <div class="map-band__frame">
        <iframe
          title="Ats Racing harita konumu"
          src="https://www.openstreetmap.org/export/embed.html?bbox=28.97%2C41.00%2C29.05%2C41.06&layer=mapnik"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
        <div class="map-band__pin" aria-hidden="true">
          <i class="pi pi-map-marker"></i>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .map-band {
        background: #0d0c0f;
      }
      .map-band__frame {
        position: relative;
        height: 420px;
        width: 100%;
        overflow: hidden;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        filter: grayscale(0.4) contrast(1.05);
      }
      .map-band__pin {
        position: absolute;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -100%);
        background: #ea0a0b;
        color: #ffffff;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        box-shadow: 0 8px 22px rgba(234, 10, 11, 0.45);
        font-size: 1.25rem;
        pointer-events: none;
      }
    `,
  ],
})
export class ContactMap {}
