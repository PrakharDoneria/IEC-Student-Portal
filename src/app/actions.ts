"use server";

import {
  getStudentsByClass,
  getStudentAttendanceSummary as getSummary,
  getStudentAttendanceDetails,
} from '@/lib/data';
import type { Student, StudentAttendanceSummary } from '@/lib/types';


export async function getStudentAttendanceSummary(rollNumber: string): Promise<{ success: true; data: StudentAttendanceSummary } | { success: false; error: string }> {
  try {
    const summaryData = await getSummary(rollNumber);
    
    if (!summaryData) {
        return { success: false, error: 'Student not found or could not fetch attendance summary.' };
    }
    
    const detailsData = await getStudentAttendanceDetails(rollNumber);

    // The summary endpoint doesn't return records, so we merge them from the details endpoint if available.
    const combinedData: StudentAttendanceSummary = {
        ...summaryData,
        attendanceRecords: detailsData?.attendanceRecords ?? []
    };

    return { success: true, data: combinedData };
  } catch (error) {
     console.error('Get Summary Error:', error);
     const errorMessage = error instanceof Error ? error.message : 'Failed to fetch student summary.';
    return { success: false, error: errorMessage };
  }
}

export async function fetchStudentsForClass(classId: string): Promise<{ success: true; data: Student[] } | { success: false; error: string }> {
  try {
    const students = await getStudentsByClass(classId);
    if (students.length === 0) {
       return { success: false, error: 'No students found for this class.' };
    }
    return { success: true, data: students };
  } catch (error) {
    console.error('Fetch Students Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students.';
    return { success: false, error: errorMessage };
  }
}
