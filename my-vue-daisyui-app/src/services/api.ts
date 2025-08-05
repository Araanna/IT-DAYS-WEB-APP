import type { User, YearLevel } from '../types/auth';

const API_BASE_URL = 'http://localhost:8000/api';

interface AttendanceRecord {
  id: number;
  attendee_id: number;
  date: string;
  am_in: string | null;
  am_out: string | null;
  pm_in: string | null;
  pm_out: string | null;
  created_at: string;
  updated_at: string;
  attendee: User;
}

interface QrResponse {
  qr_code_path: string;
  qr_code_url: string;
  full_name: string;
  email?: string;
  course?: string;
  year_level?: string;
  has_attended_today?: boolean | null;
}

class ApiService {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async register(userData: any) {
    console.log('Sending registration data:', userData);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Registration failed with status:', response.status);
      console.log('Response data:', data);
      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }

  // User profile endpoints
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: this.getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return data;
  }

  async getMyQr(token: string): Promise<QrResponse> {
    const response = await fetch(`${API_BASE_URL}/me/qr`, {
      headers: this.getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch QR code');
    }

    return data;
  }

  // SBO endpoints
  async getAttendees(token: string): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/sbo/attendees`, {
      headers: this.getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch attendees');
    }

    return data;
  }

  async scanAttendee(token: string, attendeeId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/sbo/scan/${attendeeId}`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to scan attendee');
    }

    return data;
  }

  async getAttendeeQr(token: string, attendeeId: number): Promise<QrResponse> {
    const response = await fetch(`${API_BASE_URL}/sbo/attendees/${attendeeId}/qr`, {
      headers: this.getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch attendee QR code');
    }

    return data;
  }

  // Attendance endpoints
  async logAttendance(token: string, type: string = 'am_in'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/log`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ type }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || 'Failed to log attendance');
    }

    return data;
  }

  async getAttendanceRecords(token: string): Promise<AttendanceRecord[]> {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      headers: this.getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch attendance records');
    }

    return data;
  }

  // Utility endpoints
  async getYearLevels(): Promise<YearLevel[]> {
    const response = await fetch(`${API_BASE_URL}/year-levels`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch year levels');
    }

    return data.data || data;
  }
}

export const apiService = new ApiService(); 