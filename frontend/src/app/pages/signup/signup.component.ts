import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // We'll create this service next
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-signup',
  imports: [CommonModule,ReactiveFormsModule ], // ✅ Fix for *ngIf and *ngFor
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), // ✅ Take email instead of username
    //username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('employee', [Validators.required]) // Default role
  });

  constructor(private authService: AuthService, private router: Router) {}

  // async signUp() {
  //   if (this.signupForm.valid) {
  //     const { email, password, role } = this.signupForm.value;
  //     try {
  //       await this.authService.signUp(email!, password!, role!);
  //       alert('Sign-up Successful! Redirecting to login...');
  //       this.router.navigate(['/login']); // Redirect to login
  //     } catch (error : any) {
  //       alert('Sign-up Failed: ' + error.message);
  //     }
  //   }
  // }

  async signUp() {
    if (this.signupForm.valid) {
      const { email, password, role } = this.signupForm.value;
      
      try {
        // ✅ Call the FastAPI backend signup endpoint
        const response = await fetch('https://leave-management-api-774015696306.us-central1.run.app/signup/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
  
        // ✅ Parse the JSON response
        const result = await response.json();
        
  
        if (!response.ok) {
          throw new Error(result.detail || 'Signup failed');
        }
  
        alert('Sign-up Successful! Redirecting to login...');
        this.router.navigate(['/login']); // Redirect to login
  
      } catch (error: any) {
        alert('Sign-up Failed: ' + error.message);
      }
    }
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  
}