import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from './environments/environment'; // Ensure this points to your Firebase config
import { AuthGuard } from './app/auth.guard';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';  // Import Firestore
import { provideHttpClient } from '@angular/common/http'; // Use new method

bootstrapApplication(AppComponent, {
  providers: [
    AuthGuard,
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Initialize Firebase
    provideAuth(() => getAuth()), // Provide Auth here
    provideFirestore(() => getFirestore()),
    provideHttpClient() // New method instead of HttpClientModule

  ],
});
