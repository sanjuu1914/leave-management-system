import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule

@Component({
  selector: 'app-login',
  //standalone: true, // ✅ Make the component standalone
  imports: [CommonModule,ReactiveFormsModule ], // ✅ Fix for *ngIf and *ngFor
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private auth: Auth, private router: Router) {}

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      signInWithEmailAndPassword(this.auth, email!, password!)
        .then(() => {
          this.router.navigate(['/dashboard']); // Redirect to dashboard
        })
        .catch(() => {
          alert('Wrong credentials');
        });
    }
  }
  navigateToSignup() {
    console.log('navigateToSignup() called');
    this.router.navigate(['/signup']);
  }
}
