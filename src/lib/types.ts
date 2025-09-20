export type Student = {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  avatarUrl: string;
  attendanceHistory?: AttendanceRecord[];
};

export type AttendanceRecord = {
  date: string;
  status: 'present' | 'absent';
};

export type StudentAttendanceSummary = {
  studentId: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  records: AttendanceRecord[];
};

export type Class = {
  id: string;
  name: string;
};
