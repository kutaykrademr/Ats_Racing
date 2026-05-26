import { ChangeDetectionStrategy, Component } from '@angular/core';

interface InfoItem {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}

@Component({
  selector: 'app-contact-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {
  protected readonly items: readonly InfoItem[] = [
    { icon: 'pi pi-map-marker', label: 'Adres',    value: 'Atatürk Mah. Performans Cad. No:42, İstanbul' },
    { icon: 'pi pi-phone',      label: 'Telefon',  value: '+90 (212) 000 00 00', href: 'tel:+902120000000' },
    { icon: 'pi pi-envelope',   label: 'E-posta',  value: 'info@atsracing.com',  href: 'mailto:info@atsracing.com' },
    { icon: 'pi pi-clock',      label: 'Çalışma Saatleri', value: 'Pzt – Cts · 09:00 – 19:00' },
  ];

  protected readonly socials: ReadonlyArray<{ icon: string; href: string; label: string }> = [
    { icon: 'pi pi-instagram', href: '#', label: 'Instagram' },
    { icon: 'pi pi-youtube',   href: '#', label: 'YouTube' },
    { icon: 'pi pi-facebook',  href: '#', label: 'Facebook' },
    { icon: 'pi pi-whatsapp',  href: '#', label: 'WhatsApp' },
  ];
}
