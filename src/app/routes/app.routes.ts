import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/affectation/affectation-page').then((module) => module.AffectationPage),
  },
];
