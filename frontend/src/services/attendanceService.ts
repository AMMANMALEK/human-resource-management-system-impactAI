import { apiClient } from '../api/client';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName?: string; // For admin view
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
  totalHours: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDays: number;
}

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', userId: '2', date: '2024-03-20', checkIn: '09:00', checkOut: '17:00', status: 'Present', totalHours: 8 },
  { id: '2', userId: '2', date: '2024-03-19', checkIn: '09:15', checkOut: '17:15', status: 'Present', totalHours: 8 },
  { id: '3', userId: '2', date: '2024-03-18', checkIn: null, checkOut: null, status: 'Absent', totalHours: 0 },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 800;

export const attendanceService = {
  // Get attendance for current user (Employee view)
  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_ATTENDANCE), DELAY_MS));
    }
    try {
      const response = await apiClient.get<AttendanceRecord[]>('/attendance/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  },

  // Get all attendance (Admin view)
  getAllAttendance: async (): Promise<AttendanceRecord[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_ATTENDANCE), DELAY_MS));
    }
    try {
      const response = await apiClient.get<AttendanceRecord[]>('/attendance');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all attendance records');
    }
  },

  // Check In
  checkIn: async (): Promise<AttendanceRecord> => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
              const now = new Date();
              const newRecord: AttendanceRecord = {
                id: Math.random().toString(36).substr(2, 9),
                userId: '2',
                date: now.toISOString().split('T')[0],
                checkIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                checkOut: null,
                status: 'Present',
                totalHours: 0
              };
              resolve(newRecord);
            }, DELAY_MS);
          });
    }
    try {
      const response = await apiClient.post<AttendanceRecord>('/attendance/check-in');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Check-in failed');
    }
  },

  // Check Out
  checkOut: async (recordId: string): Promise<AttendanceRecord> => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
              const now = new Date();
              const updatedRecord: AttendanceRecord = {
                id: recordId,
                userId: '2',
                date: now.toISOString().split('T')[0],
                checkIn: '09:00', // Mock start
                checkOut: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Present',
                totalHours: 8 // Mock duration
              };
              resolve(updatedRecord);
            }, DELAY_MS);
          });
    }
    try {
      const response = await apiClient.post<AttendanceRecord>(`/attendance/check-out/${recordId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Check-out failed');
    }
  },

  // Get Monthly Stats
  getMonthlyStats: async (): Promise<AttendanceStats> => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                present: 20,
                absent: 1,
                late: 2,
                halfDays: 0
              });
            }, DELAY_MS);
          });
    }
    try {
      const response = await apiClient.get<AttendanceStats>('/attendance/stats/monthly');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance stats');
    }
  }
};
