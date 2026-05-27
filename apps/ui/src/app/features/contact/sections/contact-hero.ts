import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-hero.html',
  styleUrl: './contact-hero.scss',
})
export class ContactHero {}
