
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiningTable, RestaurantService } from './restaurant.service';

@Component({
  selector: 'app-floor-plan-page',
  imports: [RouterLink],

  template: `
    <section class="page-content floor-page">

      <!-- Page heading -->
      <div class="page-heading">

        <div>
          <p class="eyebrow">TONIGHT'S SERVICE <span>·</span> LIVE</p>
          <h1>Floor plan</h1>
          <p class="heading-subtitle">
            A live view of every seat in the house.
          </p>
        </div>

        <div class="floor-actions">
          <span class="live-label">
            <i class="footer-dot"></i> Live
          </span>

          <a class="button button-secondary" routerLink="/reservations">
            View reservations <span aria-hidden="true">↗</span>
          </a>
        </div>

      </div>

      <!-- Floor summary -->
      <div class="floor-summary">

        <div>
          <strong>{{ restaurant.tables().length }}</strong>
          <span>total tables</span>
        </div>

        <div>
          <strong>{{ restaurant.availableTables() }}</strong>
          <span>available</span>
        </div>

        <div>
          <strong>{{ occupiedCount() }}</strong>
          <span>occupied</span>
        </div>

        <div>
          <strong>{{ reservedCount() }}</strong>
          <span>reserved</span>
        </div>

        <div class="occupancy-summary">
          <span>SEATS IN USE</span>

          <div class="occupancy-track">
            <i [style.width.%]="occupancy()"></i>
          </div>

          <small>{{ occupancy() }}% occupancy</small>
        </div>

      </div>

      <!-- Main floor layout -->
      <div class="floor-layout">

        <section class="floor-panel">

          <!-- Dining room heading -->
          <div class="floor-panel-heading">

            <div>
              <h2>Dining room</h2>
              <p>Tap a table to update its status</p>
            </div>

            <!-- Table status colors -->
            <div class="legend">
              <span><i class="legend-dot available"></i>Available</span>
              <span><i class="legend-dot reserved"></i>Reserved</span>
              <span><i class="legend-dot occupied"></i>Occupied</span>
            </div>

          </div>

          <!-- Main dining tables -->
          <div class="area-label">
            <span>MAIN DINING</span>
            <i></i>
          </div>

          <div class="table-grid">

            @for (table of mainTables(); track table.id) {

              <button
                class="table-card"
                [class.table-available]="table.status === 'Available'"
                [class.table-reserved]="table.status === 'Reserved'"
                [class.table-occupied]="table.status === 'Occupied'"
                [class.table-selected]="selectedTable()?.id === table.id"
                (click)="selectTable(table)">

                <span class="table-number">{{ table.id }}</span>

                <span class="table-shape">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </span>

                <strong>{{ table.seats }} seats</strong>
                <span class="table-status-text">{{ table.status }}</span>

              </button>

            }

          </div>

          <!-- Patio tables -->
          <div class="area-label patio-label">
            <span>PATIO</span>
            <i></i>
          </div>

          <div class="table-grid patio-grid">

            @for (table of patioTables(); track table.id) {

              <button
                class="table-card"
                [class.table-available]="table.status === 'Available'"
                [class.table-reserved]="table.status === 'Reserved'"
                [class.table-occupied]="table.status === 'Occupied'"
                [class.table-selected]="selectedTable()?.id === table.id"
                (click)="selectTable(table)">

                <span class="table-number">{{ table.id }}</span>

                <span class="table-shape">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </span>

                <strong>{{ table.seats }} seats</strong>
                <span class="table-status-text">{{ table.status }}</span>

              </button>

            }

          </div>

          <!-- Service station -->
          <div class="floor-note">
            <span aria-hidden="true">✳</span>
            Service station
            <span class="station-label">&nbsp;·&nbsp; Kitchen pass</span>
          </div>

        </section>

        <!-- Selected table details -->
        <aside class="table-detail-panel">

          @if (selectedTable(); as table) {

            <div class="detail-heading">

              <div>
                <p class="eyebrow">{{ table.area.toUpperCase() }}</p>
                <h2>Table {{ table.id }}</h2>
              </div>

              <button
                class="detail-close"
                aria-label="Clear selected table"
                (click)="selectedTableId.set(null)">
                ×
              </button>

            </div>

            <!-- Current table status -->
            <div
              class="detail-status"
              [class.detail-available]="table.status === 'Available'"
              [class.detail-reserved]="table.status === 'Reserved'"
              [class.detail-occupied]="table.status === 'Occupied'">

              <i></i>
              {{ table.status }}

            </div>

            <!-- Table information -->
            <div class="detail-facts">

              <div>
                <span>CAPACITY</span>
                <strong>{{ table.seats }} guests</strong>
              </div>

              <div>
                <span>AREA</span>
                <strong>{{ table.area }}</strong>
              </div>

            </div>

            <!-- Reservation details -->
            @if (reservationFor(table.id); as reservation) {

              <div class="guest-detail">

                <span class="guest-avatar">{{ reservation.initials }}</span>

                <span>
                  <strong>{{ reservation.guest }}</strong>
                  <small>{{ reservation.time }} · {{ reservation.guests }} guests</small>
                </span>

              </div>

              <p class="detail-phone">{{ reservation.phone }}</p>

            }

            @else if (table.status === 'Available') {

              <p class="detail-empty">
                No party assigned. Ready for walk-ins or a new reservation.
              </p>

            }

            @else {

              <p class="detail-empty">
                This table is occupied by a walk-in party.
              </p>

            }

            <!-- Table action buttons -->
            <div class="detail-controls">

              @if (table.status === 'Reserved') {

                <button
                  class="button button-primary button-full"
                  (click)="seatReservedTable(table)">
                  Mark guests seated
                </button>

              }

              @if (table.status === 'Available') {

                <button
                  class="button button-primary button-full"
                  (click)="restaurant.setTableStatus(table.id, 'Occupied')">
                  Seat walk-in
                </button>

              }

              @if (table.status === 'Occupied') {

                <button
                  class="button button-secondary button-full"
                  (click)="clearTable(table)">
                  Mark available
                </button>

              }

              <a class="detail-link" routerLink="/reservations">
                Manage reservations <span aria-hidden="true">↗</span>
              </a>

            </div>

          }

          @else {

            <!-- Default message -->
            <div class="detail-placeholder">

              <span class="detail-table-icon">▦</span>

              <h2>Select a table</h2>

              <p>
                Choose any table on the floor to see its seating details
                and manage availability.
              </p>

            </div>

          }

        </aside>

      </div>

    </section>
  `
})

export class FloorPlanPage {

  // Connect restaurant service
  protected readonly restaurant = inject(RestaurantService);

  // Store selected table ID
  protected readonly selectedTableId = signal<string | null>(null);

  // Get selected table details
  protected readonly selectedTable = computed(() =>
    this.restaurant.tables().find(
      (table) => table.id === this.selectedTableId()
    ) ?? null
  );

  // Get main dining tables
  protected readonly mainTables = computed(() =>
    this.restaurant.tables().filter(
      (table) => table.area === 'Main dining'
    )
  );

  // Get patio tables
  protected readonly patioTables = computed(() =>
    this.restaurant.tables().filter(
      (table) => table.area === 'Patio'
    )
  );

  // Count occupied tables
  protected readonly occupiedCount = computed(() =>
    this.restaurant.tables().filter(
      (table) => table.status === 'Occupied'
    ).length
  );

  // Count reserved tables
  protected readonly reservedCount = computed(() =>
    this.restaurant.tables().filter(
      (table) => table.status === 'Reserved'
    ).length
  );

  // Calculate occupancy percentage
  protected readonly occupancy = computed(() => {

    const tables = this.restaurant.tables();

    const totalSeats = tables.reduce(
      (total, table) => total + table.seats, 0
    );

    const seatsInUse = tables
      .filter((table) => table.status !== 'Available')
      .reduce((total, table) => total + table.seats, 0);

    return totalSeats === 0
      ? 0
      : Math.round((seatsInUse / totalSeats) * 100);

  });

  // Select a table
  protected selectTable(table: DiningTable): void {
    this.selectedTableId.set(table.id);
  }

  // Find reservation for a table
  protected reservationFor(tableId: string) {

    return this.restaurant.reservations().find(
      (reservation) =>
        reservation.table === tableId &&
        reservation.status !== 'Cancelled'
    );

  }

  // Mark reserved guests as seated
  protected seatReservedTable(table: DiningTable): void {

    const reservation = this.reservationFor(table.id);

    if (reservation) {
      this.restaurant.setReservationStatus(
        reservation.id,
        'Seated'
      );
    }

  }

  // Clear table after guests leave
  protected clearTable(table: DiningTable): void {

    const reservation = this.reservationFor(table.id);

    if (reservation) {

      this.restaurant.setReservationStatus(
        reservation.id,
        'Cancelled'
      );

    } else {

      this.restaurant.setTableStatus(
        table.id,
        'Available'
      );

    }

  }

}
