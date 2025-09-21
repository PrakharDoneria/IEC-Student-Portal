import type {
  Student,
  StudentAttendanceSummary,
  StudentAttendanceDetails,
} from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const API_BASE_URL = process.env.API_BASE_URL;

export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  if (!classId) return [];
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined in the environment.");
    return [];
  }

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
    throw new Error(`Failed to fetch students for class ${classId}`);
  }
};


export const getStudentAttendanceSummary = async (rollNumber: string): Promise<StudentAttendanceSummary | null> => {
  if (!rollNumber) return null;
   if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined in the environment.");
    return null;
  }
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
  if (!rollNumber) return null;
   if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined in the environment.");
    return null;
  }
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
