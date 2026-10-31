import { Injectable, computed, signal } from '@angular/core';

export type ReservationStatus = 'Confirmed' | 'Seated' | 'Cancelled';
export type TableStatus = 'Available' | 'Reserved' | 'Occupied';

export interface Reservation {
  id: number;
  guest: string;
  initials: string;
  time: string;
  guests: number;
  table: string;
  phone: string;
  status: ReservationStatus;
  note?: string;
}

export interface DiningTable {
  id: string;
  seats: number;
  area: 'Main dining' | 'Patio';
  status: TableStatus;
}

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  readonly reservations = signal<Reservation[]>([
    { id: 1, guest: 'Ava Patel', initials: 'AP', time: '5:30 pm', guests: 2, table: 'T01', phone: '(503) 555-0182', status: 'Confirmed' },
    { id: 2, guest: 'Noah Williams', initials: 'NW', time: '5:45 pm', guests: 4, table: 'T04', phone: '(503) 555-0144', status: 'Seated' },
    { id: 3, guest: 'Mia Chen', initials: 'MC', time: '6:00 pm', guests: 2, table: 'T03', phone: '(503) 555-0118', status: 'Confirmed', note: 'Window seat, if available' },
    { id: 4, guest: 'Theo Martin', initials: 'TM', time: '6:30 pm', guests: 6, table: 'T06', phone: '(503) 555-0191', status: 'Confirmed' },
    { id: 5, guest: 'Leila James', initials: 'LJ', time: '7:00 pm', guests: 3, table: 'T02', phone: '(503) 555-0163', status: 'Confirmed' },
    { id: 6, guest: 'Sam Rivera', initials: 'SR', time: '7:15 pm', guests: 4, table: 'T05', phone: '(503) 555-0127', status: 'Seated' },
  ]);

  readonly tables = signal<DiningTable[]>([
    { id: 'T01', seats: 2, area: 'Main dining', status: 'Reserved' },
    { id: 'T02', seats: 4, area: 'Main dining', status: 'Reserved' },
    { id: 'T03', seats: 2, area: 'Main dining', status: 'Reserved' },
    { id: 'T04', seats: 4, area: 'Main dining', status: 'Occupied' },
    { id: 'T05', seats: 4, area: 'Main dining', status: 'Occupied' },
    { id: 'T06', seats: 6, area: 'Main dining', status: 'Reserved' },
    { id: 'T07', seats: 2, area: 'Patio', status: 'Available' },
    { id: 'T08', seats: 4, area: 'Patio', status: 'Available' },
  ]);

  readonly availableTables = computed(() => this.tables().filter((table) => table.status === 'Available').length);
  readonly activeReservations = computed(() => this.reservations().filter((reservation) => reservation.status !== 'Cancelled'));
  readonly covers = computed(() => this.activeReservations().reduce((total, reservation) => total + reservation.guests, 0));

  addReservation(guest: string, time: string, guests: number, phone: string, note: string): boolean {
    const table = this.tables().find((item) => item.status === 'Available' && item.seats >= guests);
    if (!table) return false;
    const nextId = Math.max(0, ...this.reservations().map((reservation) => reservation.id)) + 1;
    this.reservations.update((items) => [...items, {
      id: nextId,
      guest: guest.trim(),
      initials: guest.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join(''),
      time,
      guests,
      table: table.id,
      phone: phone.trim(),
      status: 'Confirmed' as const,
      note: note.trim() || undefined,
    }].sort((a, b) => this.timeValue(a.time) - this.timeValue(b.time)));
    this.updateTable(table.id, 'Reserved');
    return true;
  }

  setReservationStatus(id: number, status: ReservationStatus): void {
    const reservation = this.reservations().find((item) => item.id === id);
    if (!reservation) return;
    this.reservations.update((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    this.updateTable(reservation.table, status === 'Seated' ? 'Occupied' : status === 'Cancelled' ? 'Available' : 'Reserved');
  }

  setTableStatus(id: string, status: TableStatus): void {
    this.updateTable(id, status);
  }

  private updateTable(id: string, status: TableStatus): void {
    this.tables.update((items) => items.map((table) => table.id === id ? { ...table, status } : table));
  }

  private timeValue(time: string): number {
    const [clock, period] = time.split(' ');
    const [rawHour, minute] = clock.split(':').map(Number);
    const hour = rawHour % 12 + (period === 'pm' ? 12 : 0);
    return hour * 60 + minute;
  }
}