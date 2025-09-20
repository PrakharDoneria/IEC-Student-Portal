import type {
  Student,
  Class,
  StudentAttendanceSummary,
  StudentAttendanceDetails,
} from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const API_BASE_URL = process.env.API_BASE_URL;

// Mock data for classes as there is no endpoint for it.
const classes: Class[] = [
  { id: '2C', name: 'Computer Science 2C' },
  { id: '3B', name: 'Computer Science 3B' },
  { id: '4A', name: 'Computer Science 4A' },
];

// Mock API functions
export const getClasses = async (): Promise<Class[]> => {
  // This remains a mock as there's no API endpoint for fetching all unique classes.
  // In a real app, this might be a separate endpoint or derived from student data.
  await new Promise(resolve => setTimeout(resolve, 100));
  return classes;
};

export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  if (!classId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/students/${classId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch students for class ${classId}`);
    }
    const studentsData: Omit<Student, 'avatarUrl'>[] = await res.json();
    
    // Add placeholder avatar URLs for the UI
    const studentsWithAvatars: Student[] = studentsData.map((student, index) => ({
      ...student,
      avatarUrl: PlaceHolderImages[index % PlaceHolderImages.length].imageUrl,
    }));

    return studentsWithAvatars;
  } catch (error) {
    console.error('Error in getStudentsByClass:', error);
    return [];
  }
};


export const getStudentAttendanceSummary = async (rollNumber: string): Promise<StudentAttendanceSummary> => {
  if (!rollNumber) throw new Error('Roll number is required.');
  const res = await fetch(`${API_BASE_URL}/students/${rollNumber}/attendance-summary`);
  if (!res.ok) {
    throw new Error('Failed to fetch student attendance summary.');
  }
  return res.json();
};

export const getStudentAttendanceDetails = async (rollNumber: string): Promise<StudentAttendanceDetails> => {
  if (!rollNumber) throw new Error('Roll number is required.');
  const res = await fetch(`${API_BASE_URL}/students/${rollNumber}/attendance`);
  if (!res.ok) {
    throw new Error('Failed to fetch student attendance details.');
  }
  return res.json();
};

export const markAttendance = async (payload: {
  classId: string;
  subject: string;
  attendance: { Roll_Number: string; Name: string; Status: 'Present' | 'Absent' }[];
}): Promise<{ success: true, message: string }> => {
  
  const attendanceData = payload.attendance.map(item => ({
    ...item,
    Class_Number: payload.classId,
    Subject_Code: payload.subject,
  }));

  const res = await fetch(`${API_BASE_URL}/faculty/mark_attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendanceData),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Mark Attendance API Error:", errorBody);
    throw new Error('Failed to mark attendance.');
  }

  const result = await res.json();
  return { success: true, message: result.message || "Attendance marked successfully!" };
};
