'use server';
/**
 * @fileOverview This file defines a Genkit flow for preparing student attendance data using AI.
 *
 * The flow uses historical data and current circumstances to pre-populate attendance status,
 * allowing faculty to quickly review and adjust suggestions before marking attendance.
 *
 * @exports prepareAttendanceWithAI - The main function to trigger the attendance preparation flow.
 * @exports PrepareAttendanceWithAIInput - The input type for the prepareAttendanceWithAI function.
 * @exports PrepareAttendanceWithAIOutput - The output type for the prepareAttendanceWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PrepareAttendanceWithAIInputSchema = z.object({
  classRoster: z.array(
    z.object({
      studentId: z.string().describe('The unique identifier for the student.'),
      studentName: z.string().describe('The name of the student.'),
      attendanceHistory: z
        .array(
          z.object({
            date: z.string().describe('Date of the attendance record.'),
            status: z.enum(['present', 'absent']).describe('Attendance status for the date.'),
          })
        )
        .optional()
        .describe('Historical attendance data for the student.'),
    })
  ).describe('The current roster of students in the class.'),
  currentDate: z.string().describe('The current date for marking attendance (YYYY-MM-DD).'),
  externalFactors: z
    .string()
    .optional()
    .describe(
      'Optional: Information about external factors that may affect attendance (e.g., public transport delays, campus events).'
    ),
});
export type PrepareAttendanceWithAIInput = z.infer<typeof PrepareAttendanceWithAIInputSchema>;

// Define the output schema
const PrepareAttendanceWithAIOutputSchema = z.array(
  z.object({
    studentId: z.string().describe('The unique identifier for the student.'),
    studentName: z.string().describe('The name of the student.'),
    predictedStatus: z
      .enum(['present', 'absent'])
      .describe('The AI-predicted attendance status for the student.'),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe('Confidence level (0 to 1) of the AI prediction.'),
  })
);
export type PrepareAttendanceWithAIOutput = z.infer<typeof PrepareAttendanceWithAIOutputSchema>;

// Define the main function
export async function prepareAttendanceWithAI(
  input: PrepareAttendanceWithAIInput
): Promise<PrepareAttendanceWithAIOutput> {
  return prepareAttendanceWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prepareAttendanceWithAIPrompt',
  input: {schema: PrepareAttendanceWithAIInputSchema},
  output: {schema: PrepareAttendanceWithAIOutputSchema},
  prompt: `You are an AI assistant that helps faculty members prepare student attendance records.

  Analyze the provided student roster, historical attendance data, current date, and any external factors to predict each student's attendance status (present or absent).

  For each student, consider the following:
  - Their historical attendance patterns (if available).
  - The current date and whether it falls on a regular class day.
  - Any provided external factors that might influence attendance (e.g., public transport delays, campus events).

  Output a JSON array where each object contains the student's ID, name, predicted attendance status (present or absent), and a confidence level (0 to 1) for your prediction.

  Class Roster: {{{JSON.stringify(classRoster, null, 2)}}}
Current Date: {{{currentDate}}}
  External Factors: {{{externalFactors}}}
  `, // Modified to include externalFactors
});

const prepareAttendanceWithAIFlow = ai.defineFlow(
  {
    name: 'prepareAttendanceWithAIFlow',
    inputSchema: PrepareAttendanceWithAIInputSchema,
    outputSchema: PrepareAttendanceWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

