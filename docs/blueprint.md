# **App Name**: IEC Attendance App

## Core Features:

- Student Class View: Displays a list of students belonging to a specific class fetched from the /students/:class_number endpoint. Class number comes from user selection.
- Attendance Summary: Shows the attendance summary of a student based on roll number using the /students/:roll_number/attendance-summary endpoint. Uses roll number captured in UI.
- Mark Attendance Input Prep: Prepares student data for marking attendance. Takes the current class roster from the API and allows the user to modify attendance status via the UI, as a tool for preparing data to mark attendance using /faculty/mark_attendance
- Mark Attendance Submission: Submit request to /faculty/mark_attendance with list of students marked present/absent for a given class.

## Style Guidelines:

- Primary color: Light desaturated blue (#94B0DA) to convey trust and reliability.
- Background color: Very light blue (#F0F4F8) to create a clean and spacious interface.
- Accent color: Soft green (#7CB342) for positive actions and highlights to signal success or present states.
- Font: 'PT Sans', a humanist sans-serif for both headings and body text, offering a modern look with warmth.
- Clean and organized layout with clear sections for class lists, attendance records, and marking attendance to facilitate easy navigation and use.
- Use simple and consistent icons to represent different actions and statuses related to attendance management. E.g. checkmark for 'present', cross for 'absent'.
- Use subtle transitions and animations to provide feedback on interactions and enhance user experience, like a smooth transition when navigating between different views or submitting attendance.