import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { CommonModule } from '@angular/common';


import { AuthGuard } from './auth.guard'; // Import AuthGuard

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuthenticated: boolean = false; // Default value
  title = 'leave-management-frontend';

  constructor(private authGuard: AuthGuard) {
    this.checkAuthentication(); // Call method to set authentication state
  }

  async checkAuthentication() {
    this.isAuthenticated = await this.authGuard.canActivate(); // Wait for authentication result
  }
}
