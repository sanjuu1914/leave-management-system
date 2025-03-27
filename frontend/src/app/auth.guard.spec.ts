/*import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => AuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
*/

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter = { navigate: jasmine.createSpy('navigate') };
  let mockAuth = { onAuthStateChanged: jasmine.createSpy('onAuthStateChanged') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: Auth, useValue: mockAuth }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if user is authenticated', async () => {
    mockAuth.onAuthStateChanged.and.callFake(callback => callback({ uid: '123' }));

    const result = await guard.canActivate();
    expect(result).toBeTrue();
  });

  it('should redirect to login if user is not authenticated', async () => {
    mockAuth.onAuthStateChanged.and.callFake(callback => callback(null));

    const result = await guard.canActivate();
    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
