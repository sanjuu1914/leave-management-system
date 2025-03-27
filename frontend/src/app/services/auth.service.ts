import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getFirestore  } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  // ✅ Sign Up Method
  async signUp(email: string, password: string, role: string) {
    // const email = `${username}@example.com`; // Placeholder email
    const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const username = email.split('@')[0];

    // Store user details in Firestore
    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    await setDoc(userRef, { username, email, role });

    return userCredential;
  }

  // ✅ Login Method
  async login(email: string, password: string) {
    // const email = `${username}@example.com`;
    return signInWithEmailAndPassword(this.auth, email, password);
  }
}
