import type { Student, Class, AttendanceRecord, StudentAttendanceSummary } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const classes: Class[] = [
  { id: 'cs101', name: 'Computer Science 101' },
  { id: 'ma202', name: 'Mathematics 202' },
  { id: 'ph303', name: 'Physics 303' },
];

const students: Student[] = [
  // CS101 Students
  { id: 's1', name: 'Alice Johnson', rollNumber: 'CS101-001', classId: 'cs101', avatarUrl: PlaceHolderImages[0].imageUrl },
  { id: 's2', name: 'Bob Williams', rollNumber: 'CS101-002', classId: 'cs101', avatarUrl: PlaceHolderImages[1].imageUrl },
  { id: 's3', name: 'Charlie Brown', rollNumber: 'CS101-003', classId: 'cs101', avatarUrl: PlaceHolderImages[2].imageUrl },
  { id: 's4', name: 'Diana Miller', rollNumber: 'CS101-004', classId: 'cs101', avatarUrl: PlaceHolderImages[3].imageUrl },
  { id: 's5', name: 'Ethan Davis', rollNumber: 'CS101-005', classId: 'cs101', avatarUrl: PlaceHolderImages[4].imageUrl },

  // MA202 Students
  { id: 's6', name: 'Fiona Garcia', rollNumber: 'MA202-001', classId: 'ma202', avatarUrl: PlaceHolderImages[5].imageUrl },
  { id: 's7', name: 'George Rodriguez', rollNumber: 'MA202-002', classId: 'ma202', avatarUrl: PlaceHolderImages[6].imageUrl },
  { id: 's8', name: 'Hannah Wilson', rollNumber: 'MA202-003', classId: 'ma202', avatarUrl: PlaceHolderImages[7].imageUrl },
  { id: 's9', name: 'Ian Martinez', rollNumber: 'MA202-004', classId: 'ma202', avatarUrl: PlaceHolderImages[8].imageUrl },
  { id: 's10', name: 'Jane Anderson', rollNumber: 'MA202-005', classId: 'ma202', avatarUrl: PlaceHolderImages[9].imageUrl },

  // PH303 Students
  { id: 's11', name: 'Kyle Taylor', rollNumber: 'PH303-001', classId: 'ph303', avatarUrl: PlaceHolderImages[10].imageUrl },
  { id: 's12', name: 'Laura Thomas', rollNumber: 'PH303-002', classId: 'ph303', avatarUrl: PlaceHolderImages[11].imageUrl },
  { id: 's13', name: 'Mason Hernandez', rollNumber: 'PH303-003', classId: 'ph303', avatarUrl: PlaceHolderImages[12].imageUrl },
  { id: 's14', name: 'Nora Moore', rollNumber: 'PH303-004', classId: 'ph303', avatarUrl: PlaceHolderImages[13].imageUrl },
  { id: 's15', name: 'Owen Martin', rollNumber: 'PH303-005', classId: 'ph303', avatarUrl: PlaceHolderImages[14].imageUrl },
];

const attendanceRecords: { [studentId: string]: AttendanceRecord[] } = {};

// Generate mock attendance history
students.forEach(student => {
  attendanceRecords[student.id] = [];
  for (let i = 1; i <= 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const status = Math.random() > 0.15 ? 'present' : 'absent'; // 85% chance of being present
    attendanceRecords[student.id].push({ date: date.toISOString().split('T')[0], status });
  }
});


// Mock API functions
export const getClasses = async (): Promise<Class[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return classes;
};

export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return students.filter(s => s.classId === classId);
};

export const getStudentsByClassWithHistory = async (classId: string): Promise<Student[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const classStudents = students.filter(s => s.classId === classId);
  return classStudents.map(s => ({
    ...s,
    attendanceHistory: attendanceRecords[s.id] || [],
  }));
};

export const getStudentAttendanceSummary = async (studentId: string): Promise<StudentAttendanceSummary> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const records = attendanceRecords[studentId] || [];
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const totalClasses = records.length;

  return {
    studentId,
    totalClasses,
    presentCount,
    absentCount,
    records: records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
};

export const markAttendance = async (payload: { classId: string; date: string; attendance: { studentId: string; status: 'present' | 'absent' }[] }): Promise<{ success: true }> => {
  console.log('Marking attendance for class:', payload.classId, 'on date:', payload.date);
  console.log('Payload:', payload.attendance);
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, you would save this to a database.
  payload.attendance.forEach(({ studentId, status }) => {
    if (!attendanceRecords[studentId]) {
      attendanceRecords[studentId] = [];
    }
    // Avoid duplicate records for the same day
    const existingRecordIndex = attendanceRecords[studentId].findIndex(r => r.date === payload.date);
    if (existingRecordIndex !== -1) {
      attendanceRecords[studentId][existingRecordIndex].status = status;
    } else {
      attendanceRecords[studentId].push({ date: payload.date, status });
    }
  });
  return { success: true };
};
