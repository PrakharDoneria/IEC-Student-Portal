"use server";

import {
  prepareAttendanceWithAI,
  type PrepareAttendanceWithAIOutput,
} from '@/ai/flows/prepare-attendance-with-ai';
import {
  getStudentsByClassWithHistory,
  getStudentAttendanceSummary as getSummary,
  markAttendance,
} from '@/lib/data';
import type { Student, StudentAttendanceSummary } from '@/lib/types';

export async function getAIAttendancePrediction(classId: string, externalFactors: string): Promise<{ success: true; data: PrepareAttendanceWithAIOutput } | { success: false; error: string }> {
  try {
    const students = await getStudentsByClassWithHistory(classId);

    if (students.length === 0) {
      return { success: false, error: 'No students found for this class.' };
    }

    const input = {
      classRoster: students.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        attendanceHistory: s.attendanceHistory,
      })),
      currentDate: new Date().toISOString().split('T')[0],
      externalFactors: externalFactors || 'No special circumstances reported.',
    };

    const result = await prepareAttendanceWithAI(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Prediction Error:', error);
    return { success: false, error: 'Failed to get AI prediction.' };
  }
}

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
