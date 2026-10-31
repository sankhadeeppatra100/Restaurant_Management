import { Routes } from '@angular/router';
import { FloorPlanPage } from './floor-plan-page';
import { ReservationsPage } from './reservations-page';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'reservations' },
	{ path: 'reservations', component: ReservationsPage, title: 'Reservations | Spicy Zone' },
	{ path: 'floor-plan', component: FloorPlanPage, title: 'Floor plan | Spicy Zone' },
	{ path: '**', redirectTo: 'reservations' },
];
