"use server";

import {
  getStudentsByClass,
  getStudentAttendanceSummary as getSummary,
  getStudentAttendanceDetails,
  markAttendance,
} from '@/lib/data';
import type { Student, StudentAttendanceSummary, StudentAttendanceDetails } from '@/lib/types';

type AttendancePayload = {
  Roll_Number: string;
  Name: string;
  Status: 'Present' | 'Absent';
};

export async function submitAttendance(classId: string, subject: string, attendanceData: AttendancePayload[]): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    const result = await markAttendance({
      classId,
      subject,
      attendance: attendanceData,
    });
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Submit Attendance Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit attendance.';
    return { success: false, error: errorMessage };
  }
}

export async function getStudentAttendanceSummary(rollNumber: string): Promise<{ success: true; data: StudentAttendanceSummary } | { success: false; error: string }> {
  try {
    const summaryData = await getSummary(rollNumber);
    const detailsData = await getStudentAttendanceDetails(rollNumber);

    if (!summaryData) {
        return { success: false, error: 'Could not fetch attendance summary.' };
    }

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
    return { success: true, data: students };
  } catch (error) {
    console.error('Fetch Students Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students.';
    return { success: false, error: errorMessage };
  }
}