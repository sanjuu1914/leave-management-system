import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Fix: Import FormsModule
import { HttpClient } from '@angular/common/http'; // ✅ Fix: Import HttpClient
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Fix: Add FormsModule here
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.css']
})
export class LeaveRequestsComponent {
  showLeaveForm = false; // Controls modal visibility
  today: string = new Date().toISOString().split('T')[0]; // Get today's date
  leaveData = { leaveType: '', startDate: '', endDate: '', reason: '' };

  constructor(private http: HttpClient) {} // ✅ Fix: Inject HttpClient

  openLeaveForm() {
    this.showLeaveForm = true; // ✅ Ensure form opens properly
  }

  closeLeaveForm() {
    this.showLeaveForm = false; // ✅ Close form manually when needed
  }

  submitLeave(event: Event) {
    event.preventDefault(); // ✅ Fix: Prevent form from refreshing page

    if (!this.leaveData.startDate || !this.leaveData.endDate || !this.leaveData.reason) {
      alert("Please fill all the required fields!");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user')!); // Get logged-in user
    if (!user) {
      alert("User not logged in!");
      return;
    }

    const leaveRequest = { ...this.leaveData, employee_id: user.uid }; // Include user ID
    this.http.post<{ message: string }>(`${environment.apiUrl}/apply_leave/`, leaveRequest)
      .subscribe({
        next: (res: { message: string }) => { // ✅ Fix: Explicitly define type
          alert(res.message);
          this.leaveData = { leaveType: '', startDate: '', endDate: '', reason: '' }; // Reset form
          this.showLeaveForm = false; // ✅ Close the modal **only if API is successful**
        },
        error: (err: any) => { // ✅ Fix: Explicitly define type
          alert("Error submitting leave request: " + err.message);
        }
      });
  }
}
