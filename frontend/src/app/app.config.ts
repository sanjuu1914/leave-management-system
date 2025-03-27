/*import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';  // ✅ Correctly import ReactiveFormsModule

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule) // ✅ Provide ReactiveFormsModule correctly
  ]
};
;


import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth } from '@angular/fire/auth'; // Firebase Auth
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment'; // Import environment
import { ReactiveFormsModule } from '@angular/forms'; // Import Forms modules

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule) // Provide forms support
  ]
};
*/

import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment'; // Import environment
import { ReactiveFormsModule } from '@angular/forms'; // Import Forms modules
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // IMPORT THIS LINE


import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // ✅ Add Firebase
    provideAuth(() => getAuth()), // ✅ Provide Authentication
    provideFirestore(() => getFirestore()) // ADD THIS LINE

  ]
};