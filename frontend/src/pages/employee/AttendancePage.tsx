import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, LogIn, LogOut, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { attendanceService, AttendanceRecord, AttendanceStats } from '../../services/attendanceService';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const getLocalTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        attendanceService.getMyAttendance(),
        attendanceService.getStats()
      ]);
      setRecords(data);
      setStats(statsData);

      // Check if already checked in today using local date matching backend
      const today = getLocalTodayDate();
      const todayRec = data.find(r => r.date === today);

      if (todayRec) {
        setTodayRecord(todayRec);
        setIsCheckedIn(!!todayRec.checkIn && !todayRec.checkOut);
      } else {
        setTodayRecord(null);
        setIsCheckedIn(false);
      }
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const record = await attendanceService.checkIn();
      setTodayRecord(record);
      setIsCheckedIn(true);
      // Refresh list
      fetchData();
    } catch (error: any) {
      console.error('Check-in failed', error);
      // If already checked in, refresh data to sync state
      if (error.message?.includes('Already checked in')) {
        fetchData();
      }
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    try {
      await attendanceService.checkOut();
      setIsCheckedIn(false);
      // Refresh list
      fetchData();
    } catch (error) {
      console.error('Check-out failed', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading attendance data...</div>;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">{currentDate}</p>
        </div>

        {/* Check-in/out Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Current Status</span>
            <span className={`font-semibold ${isCheckedIn ? 'text-green-600' : 'text-gray-700'}`}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          {isCheckedIn ? (
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleCheckOut}>
              <LogOut className="mr-2 h-4 w-4" /> Check Out
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCheckIn}>
              <LogIn className="mr-2 h-4 w-4" /> Check In
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600">Present</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.present} <span className="text-xs font-normal text-gray-500">days</span></p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <XCircle size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600">Absent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.absent} <span className="text-xs font-normal text-gray-500">days</span></p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <Clock size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600">Late Login</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.late} <span className="text-xs font-normal text-gray-500">days</span></p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600">Half Days</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.halfDays} <span className="text-xs font-normal text-gray-500">days</span></p>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Check In</th>
                <th className="px-6 py-3 font-medium">Check Out</th>
                <th className="px-6 py-3 font-medium">Work Hours</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.checkIn || '--:--'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.checkOut || '--:--'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.totalHours} hrs
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> Office
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
