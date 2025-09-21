
export type Student = {
  _id: string;
  Name: string;
  Roll_Number: string;
  Class_Number: string;
  Mobile_Number: string;
  avatarUrl: string; // Keep this for UI, can be a placeholder
};

export type NewStudent = {
  name: string;
  class: string;
  roll_number: string;
  mobile_number: string;
}

export type AttendanceRecord = {
  Date: string;
  Status: 'Present' | 'Absent';
  Subject_Code: string;
  Class_Number: string;
};

export type StudentAttendanceSummary = {
  student: {
    Name: string;
    Class_Number: string;
    Roll_Number: string;
    Mobile_Number: string;
  };
  summary: {
    totalDays: number;
    presentDays: number;
    overallPercentage: string;
    subjects: {
      [key: string]: {
        totalClasses: number;
        present: number;
        percentage: string;
      };
    };
  };
  attendanceRecords: { Date: string; [key: string]: string }[];
};

export type Class = {
  id: string;
  name: string;
};

// This will be the type for the data returned by `/students/:roll_number/attendance`
export type StudentAttendanceDetails = {
    student: {
        Name: string,
        Class_Number: string,
        Roll_Number: string,
        Mobile_Number: string
    },
    attendanceRecords: { Date: string, [key:string]: string }[]
}

export type AttendanceMarking = {
  Roll_Number: string;
  Name: string;
  Status: 'Present' | 'Absent';
  Subject_Code: string;
  Class_Number: string;
};
