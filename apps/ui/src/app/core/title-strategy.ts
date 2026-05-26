import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const APP_NAME = 'Ats Racing';

@Injectable({ providedIn: 'root' })
export class BrandTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(state: RouterStateSnapshot): void {
    const fromData = this.firstTitle(state);
    this.title.setTitle(fromData ? `${fromData} · ${APP_NAME}` : APP_NAME);
  }

  private firstTitle(state: RouterStateSnapshot): string | undefined {
    let route = state.root;
    let title: string | undefined;
    while (route) {
      const t = route.data?.['title'];
      if (typeof t === 'string') title = t;
      route = route.firstChild!;
    }
    return title;
  }
}
