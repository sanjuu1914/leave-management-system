import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut, onAuthStateChanged, getAuth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';  // ✅ Import for RxJS async handling

@Component({
  selector: 'app-dashboard',
  standalone: true,  // ✅ Standalone components in Angular
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  minDate: string;
  isModalOpen = false;
  leaveType = 'Sick';
  startDate = '';
  endDate = '';
  reason = '';
  userEmail: string = '';
  username: string = ''; // Declare username variable
  leaveHistory: any[] = [];

  constructor(private auth: Auth, private router: Router, private http: HttpClient) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Formats as YYYY-MM-DD

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.userEmail = user.email!;
        this.username = this.userEmail.split('@')[0]; // Extract part before '@'
        this.username = this.username.charAt(0).toUpperCase() + this.username.slice(1); // Capitalize first letter

        const role = await this.fetchUserRole(user.uid);  // ✅ Fetch user role

        if (role === 'manager') {
          this.router.navigate(['/manager-dashboard']);  // Redirect to manager page
        }
        await this.fetchLeaveHistory();  // ✅ Ensure leave history is fetched after login
      } else {
        this.router.navigate(['/login']); // Redirect if not logged in
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }


  async fetchUserRole(uid: string): Promise<string> {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) return 'employee'; // Default role
  
      const response = await firstValueFrom(
        this.http.get<{ role: string }>(`${environment.apiUrl}/user_role/${uid}`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` })
        })
      );
  
      return response.role;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return 'employee'; // Default role in case of error
    }
  }

  getStatusIcon(status: string): string {
    switch(status.toLowerCase()) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      case 'pending':
        return '⟳';
      case 'cancelled':
        return '∅';
      default:
        return '';
    }
  }
  

  /** ✅ Fetch Leave History with Firebase Token */
  async fetchLeaveHistory() {
    try {
      const idToken = await this.getIdToken();
      console.log("Fetched ID Token:", idToken);
      if (!idToken) return;

      const response = await firstValueFrom(
        this.http.get<{ leave_requests: any[] }>(`${environment.apiUrl}/leave_requests/`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` })  // ✅ Add token to headers
        })
      );
      console.log("API Response:", response);
      this.leaveHistory = response.leave_requests;
    } catch (error) {
      console.error("Error fetching leave history:", error);
    }
  }

  /** ✅ Submit Leave Request */
  async submitLeave() {
    const leaveRequest = {
      leave_type: this.leaveType,
      start_date: this.startDate,
      end_date: this.endDate,
      reason: this.reason
    };

    try {
      const idToken = await this.getIdToken();
      if (!idToken) return;

      await firstValueFrom(this.http.post(`${environment.apiUrl}/apply_leave/`, leaveRequest, {
        headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` })
      }));

      alert("Leave request submitted!");
      await this.fetchLeaveHistory();  // Refresh leave history
      this.closeModal();
    } catch (error) {
      alert("Error submitting leave request!");
      console.error(error);
    }
  }

  /** ✅ Withdraw Leave Request */
  async withdrawLeave(leaveId: string) {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) return;

      await firstValueFrom(this.http.delete(`${environment.apiUrl}/withdraw_leave/${leaveId}`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` })
      }));

      alert("Leave request withdrawn!");
      console.log("Leave ID:", leaveId);
      await this.fetchLeaveHistory();  // Refresh leave history
    } catch (error) {
      alert("Error withdrawing leave!");
      console.error(error);
    }
  }

  /** ✅ Get Firebase Auth Token */
  private async getIdToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated!");
      this.router.navigate(['/login']); // Redirect to login
      return null;
    }
    return await user.getIdToken();  // ✅ Retrieve ID token
  }

  /** ✅ Logout Function */
  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }
}
