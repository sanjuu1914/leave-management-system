import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LeaveRequestsComponent } from './pages/leave-requests/leave-requests.component';
import { AuthGuard } from './auth.guard';  // ✅ Import the Auth Guard

export const routes: Routes = [

  { path: 'signup', component: SignupComponent },
  { path: 'manager-dashboard', loadComponent: () => import('./pages/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirect to login by default
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },  // ✅ Use direct import instead
  { path: 'leave-requests', component: LeaveRequestsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' } // Handle unknown routes
];