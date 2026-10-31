import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { RestaurantService } from './restaurant.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly restaurant = inject(RestaurantService);
  protected readonly currentSection = signal(this.sectionFromUrl(inject(Router).url));
  protected readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());

  constructor() {
    inject(Router).events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      if (event instanceof NavigationEnd) this.currentSection.set(this.sectionFromUrl(event.urlAfterRedirects));
    });
  }

  private sectionFromUrl(url: string): string {
    return url.includes('/floor-plan') ? 'Floor plan' : 'Reservations';
  }
}
