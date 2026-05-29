import { Route } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout';
import { OverviewPage } from './pages/overview/overview-page';
import { FilesPage } from './pages/files/files-page';

export const dashboardRoutes: Route[] = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        component: OverviewPage,
        data: { title: 'Genel Bakış' },
      },
      {
        path: 'files',
        component: FilesPage,
        data: { title: 'Dosyalarım' },
      },
      {
        path: 'files/:id',
        loadComponent: () =>
          import('./pages/files/file-detail-page').then(m => m.FileDetailPage),
        data: { title: 'Dosya Detayı' },
      },
      {
        path: 'tools',
        loadComponent: () =>
          import('./pages/tools/tools-page').then(m => m.ToolsPage),
        data: { title: 'Araçlar' },
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./pages/support/support-page').then(m => m.SupportPage),
        data: { title: 'Destek' },
      },
    ],
  },
];
