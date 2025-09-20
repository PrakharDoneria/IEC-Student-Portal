"use server";

import {
  getStudentsByClass,
  getStudentAttendanceSummary as getSummary,
  markAttendance,
} from '@/lib/data';
import type { Student, StudentAttendanceSummary } from '@/lib/types';

type AttendancePayload = {
  studentId: string;
  status: 'present' | 'absent';
};

export async function submitAttendance(classId: string, attendanceData: AttendancePayload[]): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    await markAttendance({
      classId,
      date: new Date().toISOString().split('T')[0],
      attendance: attendanceData,
    });
    return { success: true, message: 'Attendance marked successfully!' };
  } catch (error) {
    console.error('Submit Attendance Error:', error);
    return { success: false, error: 'Failed to submit attendance.' };
  }
}


export async function getStudentAttendanceSummary(studentId: string): Promise<{ success: true; data: StudentAttendanceSummary } | { success: false; error: string }> {
  try {
    const data = await getSummary(studentId);
    return { success: true, data };
  } catch (error) {
     console.error('Get Summary Error:', error);
    return { success: false, error: 'Failed to fetch student summary.' };
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
    return { success: false, error: 'Failed to fetch students.' };
  }
}
