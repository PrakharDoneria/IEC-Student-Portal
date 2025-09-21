
"use server";

import {
  getStudentsByClass,
  getStudentAttendanceSummary as getSummary,
  getStudentAttendanceDetails,
  addStudent as addNewStudent,
  markAttendance as saveAttendance,
} from '@/lib/data';
import type { Student, StudentAttendanceSummary, NewStudent, AttendanceMarking } from '@/lib/types';


export async function getStudentAttendanceSummary(rollNumber: string): Promise<{ success: true; data: StudentAttendanceSummary } | { success: false; error: string }> {
  try {
    const summaryData = await getSummary(rollNumber);
    
    if (!summaryData) {
        return { success: false, error: 'Student not found or could not fetch attendance summary.' };
    }
    
    const detailsData = await getStudentAttendanceDetails(rollNumber);
    
    const consolidatedRecords: { [date: string]: { Date: string; [key: string]: string } } = {};

    if (detailsData?.attendanceRecords) {
        detailsData.attendanceRecords.forEach(record => {
            const { Date, ...rest } = record;
            if (consolidatedRecords[Date]) {
                consolidatedRecords[Date] = { ...consolidatedRecords[Date], ...rest };
            } else {
                consolidatedRecords[Date] = record;
            }
        });
    }

    const combinedData: StudentAttendanceSummary = {
        ...summaryData,
        attendanceRecords: Object.values(consolidatedRecords)
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

export async function addStudent(studentData: NewStudent): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const response = await addNewStudent(studentData);
    if (response.students && response.students.length > 0) {
      return { success: true, data: response.students[0] };
    }
    return { success: false, error: response.message || 'Failed to add student.' };
  } catch (error) {
    console.error('Add Student Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function markAttendance(attendanceData: AttendanceMarking[]): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const response = await saveAttendance(attendanceData);
    return { success: true, data: response };
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

