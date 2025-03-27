import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signOut, onAuthStateChanged, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent {
  leaveRequests: any[] = [];
  selectedStatus: string = 'All';
  userEmail: string = ''; // Stores logged-in user's email
  username: string = ''; // Stores the formatted username
  isModalOpen = false;
  leaveType: string = '';
  startDate: string = '';
  endDate: string = '';
  reason: string = '';
  minDate: string = new Date().toISOString().split('T')[0]; // Sets minimum date

  constructor(private auth: Auth, private http: HttpClient, private router: Router) {
    this.fetchLeaveRequests();
    this.getUserEmail();
  }

  async fetchLeaveRequests() {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) {
        console.error("User token is missing");
        return;
      }

      const response = await firstValueFrom(
        this.http.get<{ leave_requests: any[] }>(`${environment.apiUrl}/leaves/`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` })
        })
      );

      this.leaveRequests = response.leave_requests;
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  }

  private async getIdToken(): Promise<string | null> {
    const auth = getAuth();
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.error("User is not authenticated!");
          this.router.navigate(['/login']);
          resolve(null);
        } else {
          const token = await user.getIdToken();
          resolve(token);
        }
      });
    });
  }

  async updateLeaveStatus(leaveId: string, status: string) {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) return;

      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/update_leave_status/`, 
          { leave_id: leaveId, status: status }, 
          { headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` }) }
        )
      );

      alert(`Leave request ${status}`);
      this.fetchLeaveRequests(); // Refresh the list after update
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  }

  async withdrawLeave(leaveId: string) {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) return;

      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/withdraw_leave/`, 
          { leave_id: leaveId }, 
          { headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` }) }
        )
      );

      alert("Leave request canceled.");
      this.fetchLeaveRequests();
    } catch (error) {
      console.error("Error withdrawing leave:", error);
    }
  }

  getFilteredRequests() {
    if (this.selectedStatus === 'All') {
      return this.leaveRequests;
    }
    return this.leaveRequests.filter(request => request.status === this.selectedStatus);
  }    

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return '✅';  // Green check mark
      case 'rejected':
        return '❌';  // Red cross
      case 'pending':
        return '⏳';  // Hourglass
      case 'cancelled':
        return '🚫';  // Prohibited symbol
      default:
        return '❔';  // Question mark (for unknown status)
    }
  }

  getUserEmail() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userEmail = user.email || 'User';
        this.username = this.userEmail.split('@')[0]; // Extract part before '@'
        this.username = this.username.charAt(0).toUpperCase() + this.username.slice(1); // Capitalize first letter
      }
    });
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async submitLeave() {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) return;

      const leaveData = {
        leave_type: this.leaveType,
        start_date: this.startDate,
        end_date: this.endDate,
        reason: this.reason
      };

      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/apply_leave/`, 
          leaveData, 
          { headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` }) }
        )
      );

      alert("Leave request submitted.");
      this.closeModal();
      this.fetchLeaveRequests();
    } catch (error) {
      console.error("Error applying leave:", error);
    }
  }
}
