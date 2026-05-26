import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly nav: readonly NavItem[] = [
    { label: 'Anasayfa', path: '/' },
    { label: 'Hakkımızda', path: '/about' },
    { label: 'Shop', path: '/shop' },
    { label: 'İletişim', path: '/contact' },
  ];

  protected readonly scrolled = signal(false);
  protected readonly mobileOpen = signal(false);

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
