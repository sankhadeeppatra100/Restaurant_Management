
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RestaurantService, ReservationStatus } from './restaurant.service';

@Component({
  selector: 'app-reservations-page',
  imports: [FormsModule, RouterLink],

  template: `
    <section class="page-content">

      <!-- Page heading -->
      <div class="page-heading">

        <div>
          <p class="eyebrow">TONIGHT'S SERVICE <span>·</span> LIVE</p>
          <h1>Reservations</h1>
          <p class="heading-subtitle">
            A good evening starts with knowing who's coming.
          </p>
        </div>

        <button class="button button-primary" (click)="showForm.set(true)">
          <span aria-hidden="true">＋</span>
          New reservation
        </button>

      </div>

      <!-- Reservation statistics -->
      <div class="stats-grid">

        <article class="stat-card">
          <span class="stat-label">TONIGHT'S BOOKINGS</span>

          <div class="stat-line">
            <strong>{{ restaurant.activeReservations().length }}</strong>
            <span class="stat-icon bookings-icon">▤</span>
          </div>

          <small>
            <b>{{ restaurant.covers() }} covers</b> expected tonight
          </small>
        </article>

        <article class="stat-card">
          <span class="stat-label">TABLES AVAILABLE</span>

          <div class="stat-line">
            <strong>{{ restaurant.availableTables() }}</strong>
            <span class="stat-icon available-icon">◷</span>
          </div>

          <small>of {{ restaurant.tables().length }} tables total</small>
        </article>

        <article class="stat-card">
          <span class="stat-label">GUESTS SEATED</span>

          <div class="stat-line">
            <strong>{{ seatedCovers() }}</strong>
            <span class="stat-icon seated-icon">♧</span>
          </div>

          <small>{{ seatedCount() }} parties checked in</small>
        </article>

        <article class="stat-card">
          <span class="stat-label">NEXT ARRIVAL</span>

          <div class="stat-line">
            <strong class="next-arrival">
              {{ nextArrival()?.time ?? '—' }}
            </strong>

            <span class="stat-icon arrival-icon">↗</span>
          </div>

          <small>
            {{ nextArrival()?.guest ?? 'No upcoming guests' }}
          </small>
        </article>

      </div>

      <!-- Reservation table section -->
      <section class="reservation-panel">

        <div class="panel-heading">

          <div>
            <h2>Tonight's service</h2>
            <p>{{ visibleReservations().length }} reservations on the books</p>
          </div>

          <!-- Search reservation -->
          <label class="search-box">
            <span aria-hidden="true">⌕</span>

            <input
              aria-label="Search reservations"
              placeholder="Search guests"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)">
          </label>

        </div>

        <!-- Filter buttons -->
        <div class="reservation-toolbar">

          <div class="filter-tabs" role="group" aria-label="Filter reservations">

            <button
              [class.selected]="filter() === 'All'"
              (click)="filter.set('All')">
              All <span>{{ restaurant.reservations().length }}</span>
            </button>

            <button
              [class.selected]="filter() === 'Confirmed'"
              (click)="filter.set('Confirmed')">
              Confirmed
            </button>

            <button
              [class.selected]="filter() === 'Seated'"
              (click)="filter.set('Seated')">
              Seated
            </button>

          </div>

          <span class="service-window">5:00 pm – 10:00 pm</span>

        </div>

        <!-- Reservation list -->
        <div class="reservation-table-wrap">

          <table class="reservation-table">

            <thead>
              <tr>
                <th>GUEST</th>
                <th>TIME</th>
                <th>PARTY</th>
                <th>TABLE</th>
                <th>STATUS</th>
                <th><span class="visually-hidden">Actions</span></th>
              </tr>
            </thead>

            <tbody>

              @for (reservation of visibleReservations(); track reservation.id) {

                <tr>

                  <td>
                    <div class="guest-cell">

                      <span class="guest-avatar avatar-{{ reservation.id % 4 }}">
                        {{ reservation.initials }}
                      </span>

                      <span>
                        <strong>{{ reservation.guest }}</strong>
                        <small>{{ reservation.phone }}</small>
                      </span>

                    </div>
                  </td>

                  <td class="time-cell">
                    {{ reservation.time }}
                  </td>

                  <td>
                    {{ reservation.guests }}
                    <span class="muted">
                      {{ reservation.guests === 1 ? 'guest' : 'guests' }}
                    </span>
                  </td>

                  <td>
                    <span class="table-label">{{ reservation.table }}</span>
                  </td>

                  <td>
                    <span
                      class="status-badge"
                      [class.confirmed]="reservation.status === 'Confirmed'"
                      [class.seated]="reservation.status === 'Seated'"
                      [class.cancelled]="reservation.status === 'Cancelled'">

                      <span></span>
                      {{ reservation.status }}

                    </span>
                  </td>

                  <td>
                    <div class="row-actions">

                      @if (reservation.status === 'Confirmed') {

                        <button
                          class="action-link"
                          (click)="restaurant.setReservationStatus(reservation.id, 'Seated')">
                          Seat
                        </button>

                      }

                      @if (reservation.status !== 'Cancelled') {

                        <button
                          class="more-button"
                          [attr.aria-label]="'Cancel ' + reservation.guest + ' reservation'"
                          (click)="restaurant.setReservationStatus(reservation.id, 'Cancelled')">
                          ×
                        </button>

                      }

                    </div>
                  </td>

                </tr>

                @if (reservation.note) {

                  <tr class="note-row">
                    <td colspan="6">
                      <span>NOTE</span>
                      {{ reservation.note }}
                    </td>
                  </tr>

                }

              }

              @empty {

                <tr>
                  <td class="empty-state" colspan="6">
                    No reservations match this search.
                  </td>
                </tr>

              }

            </tbody>

          </table>

        </div>

        <!-- Table footer -->
        <div class="panel-footer">

          <span>
            <i class="footer-dot"></i>
            Live table availability
          </span>

          <a routerLink="/floor-plan">
            View floor plan <span aria-hidden="true">↗</span>
          </a>

        </div>

      </section>

    </section>

    <!-- New reservation popup -->
    @if (showForm()) {

      <div
        class="modal-backdrop"
        (click)="showForm.set(false)"
        (keydown.escape)="showForm.set(false)">

        <section
          class="reservation-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-form-title"
          (click)="$event.stopPropagation()">

          <!-- Form heading -->
          <div class="modal-heading">

            <div>
              <p class="eyebrow">ADD TO TONIGHT</p>
              <h2 id="reservation-form-title">New reservation</h2>
            </div>

            <button
              class="modal-close"
              aria-label="Close"
              (click)="showForm.set(false)">
              ×
            </button>

          </div>

          <!-- Reservation form -->
          <form (ngSubmit)="submitReservation()">

            <label>
              Guest name

              <input
                name="guest"
                [(ngModel)]="guest"
                placeholder="e.g. Alex Morgan"
                required>
            </label>

            <div class="form-row">

              <label>
                Arrival time

                <select name="time" [(ngModel)]="time">
                  <option>5:00 pm</option>
                  <option>5:30 pm</option>
                  <option>6:00 pm</option>
                  <option>6:30 pm</option>
                  <option>7:00 pm</option>
                  <option>7:30 pm</option>
                  <option>8:00 pm</option>
                  <option>8:30 pm</option>
                </select>
              </label>

              <label>
                Party size

                <select name="guests" [(ngModel)]="guests">
                  <option [ngValue]="1">1 guest</option>
                  <option [ngValue]="2">2 guests</option>
                  <option [ngValue]="3">3 guests</option>
                  <option [ngValue]="4">4 guests</option>
                  <option [ngValue]="5">5 guests</option>
                  <option [ngValue]="6">6 guests</option>
                </select>
              </label>

            </div>

            <label>
              Phone number

              <input
                name="phone"
                [(ngModel)]="phone"
                type="tel"
                placeholder="(503) 555-0100">
            </label>

            <label>
              Guest note
              <span class="optional">OPTIONAL</span>

              <textarea
                name="note"
                [(ngModel)]="note"
                rows="2"
                placeholder="Occasion, seating preference...">
              </textarea>
            </label>

            @if (formError()) {

              <p class="form-error" role="alert">
                {{ formError() }}
              </p>

            }

            <p class="availability-hint">
              <span class="footer-dot"></span>
              {{ restaurant.availableTables() }} tables currently available
            </p>

            <!-- Form buttons -->
            <div class="modal-actions">

              <button
                type="button"
                class="button button-quiet"
                (click)="showForm.set(false)">
                Cancel
              </button>

              <button
                class="button button-primary"
                type="submit">
                Confirm reservation
              </button>

            </div>

          </form>

        </section>

      </div>

    }

  `
})

export class ReservationsPage {

  // Restaurant service
  protected readonly restaurant = inject(RestaurantService);

  // Form and filter values
  protected readonly showForm = signal(false);
  protected readonly filter = signal<'All' | ReservationStatus>('All');
  protected readonly query = signal('');
  protected readonly formError = signal('');

  // New reservation details
  protected guest = '';
  protected time = '6:00 pm';
  protected guests = 2;
  protected phone = '';
  protected note = '';

  // Show reservations according to search and filter
  protected readonly visibleReservations = computed(() => {

    const searchText = this.query().trim().toLowerCase();

    return this.restaurant.reservations().filter((reservation) => {

      const matchesFilter =
        this.filter() === 'All' ||
        reservation.status === this.filter();

      const matchesSearch =
        reservation.guest.toLowerCase().includes(searchText) ||
        reservation.table.toLowerCase().includes(searchText);

      return matchesFilter && (!searchText || matchesSearch);

    });

  });

  // Calculate total seated guests
  protected readonly seatedCovers = computed(() => {

    return this.restaurant.reservations()
      .filter((reservation) => reservation.status === 'Seated')
      .reduce((total, reservation) => total + reservation.guests, 0);

  });

  // Count seated parties
  protected readonly seatedCount = computed(() => {

    return this.restaurant.reservations()
      .filter((reservation) => reservation.status === 'Seated')
      .length;

  });

  // Find next confirmed arrival
  protected readonly nextArrival = computed(() => {

    return this.restaurant.reservations().find(
      (reservation) => reservation.status === 'Confirmed'
    );

  });

  // Submit new reservation
  protected submitReservation(): void {

    if (!this.guest.trim()) {
      return;
    }

    const added = this.restaurant.addReservation(
      this.guest,
      this.time,
      Number(this.guests),
      this.phone,
      this.note
    );

    if (!added) {

      this.formError.set(
        'No available table can fit this party. Try a smaller party size.'
      );

      return;
    }

    // Close form after successful booking
    this.showForm.set(false);
    this.formError.set('');

    // Clear form fields
    this.guest = '';
    this.phone = '';
    this.note = '';

  }

}
