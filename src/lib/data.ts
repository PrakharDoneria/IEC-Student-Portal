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
       // If the API returns a 404 or other error, we'll log it and return an empty array.
       console.error(`Failed to fetch students for class ${classId}. Status: ${res.status}`);
       return [];
    }
    const studentsData: Omit<Student, 'avatarUrl' | '_id'>[] = await res.json();
    
    if (!Array.isArray(studentsData)) {
      console.error("API did not return an array for students of class", classId);
      return [];
    }

    // Add placeholder avatar URLs for the UI
    const studentsWithAvatars: Student[] = studentsData.map((student, index) => ({
      ...student,
      _id: student.Roll_Number, // Use Roll_Number as a unique ID for React keys
      avatarUrl: PlaceHolderImages[index % PlaceHolderImages.length].imageUrl,
    }));

    return studentsWithAvatars;
  } catch (error) {
    console.error('Error in getStudentsByClass:', error);
    return [];
  }
};


export const getStudentAttendanceSummary = async (rollNumber: string): Promise<StudentAttendanceSummary | null> => {
  if (!rollNumber) throw new Error('Roll number is required.');
  try {
    const res = await fetch(`${API_BASE_URL}/students/${rollNumber}/attendance-summary`);
    if (!res.ok) {
      console.error(`Failed to fetch attendance summary for roll number ${rollNumber}. Status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching attendance summary for ${rollNumber}:`, error);
    return null;
  }
};

export const getStudentAttendanceDetails = async (rollNumber: string): Promise<StudentAttendanceDetails | null> => {
  if (!rollNumber) throw new Error('Roll number is required.');
  try {
    const res = await fetch(`${API_BASE_URL}/students/${rollNumber}/attendance`);
    if (!res.ok) {
      console.error(`Failed to fetch attendance details for roll number ${rollNumber}. Status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching attendance details for ${rollNumber}:`, error);
    return null;
  }
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