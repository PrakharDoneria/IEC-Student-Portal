
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Shield } from "lucide-react";

function ApiEndpoint({ method, path, description, request, response }: { method: 'GET' | 'POST', path: string, description: string, request?: string, response: string }) {
  const methodVariant = method === 'POST' ? 'default' : 'secondary';
  const methodClass = method === 'POST' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <AccordionItem value={path}>
      <AccordionTrigger>
        <div className="flex items-center gap-4">
          <Badge variant={methodVariant} className={cn('w-20 justify-center', methodClass)}>{method}</Badge>
          <span className="font-mono text-sm">{path}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        {request && (
          <div>
            <h4 className="font-semibold mb-2">Example Request:</h4>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
              <code>{request}</code>
            </pre>
          </div>
        )}
        <div>
          <h4 className="font-semibold mb-2">Example Response:</h4>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
            <code>{response}</code>
          </pre>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

// Helper since ShadCN/ui components are not directly usable in a constant
function cn(...inputs: any[]) {
    // A simplified version of the actual cn utility
    return inputs.filter(Boolean).join(' ');
}


export default function FacultyDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">API Endpoint Documentation</h1>
      <p className="text-muted-foreground">
        This page details the available API endpoints for the attendance management system.
      </p>

      <div className="space-y-8">
        {/* Student Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users /> Student Routes
            </CardTitle>
            <CardDescription>Endpoints related to student data and attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <ApiEndpoint
                method="POST"
                path="/students/add_students"
                description="Adds one or more new students to the database. If roll_number is not provided, it is generated automatically."
                request={`[
  {
    "name": "Prakhar Doneria",
    "class": "2C",
    "mobile_number": "6395203201",
    "roll_number": "2400900100104"
  }
]`}
                response={`{
  "message": "Students added!",
  "students": [
    {
      "_id": "650f2c9b72acb9f67e2a9c1f",
      "Name": "Prakhar Doneria",
      "Class_Number": "2C",
      "Roll_Number": "2400900100104",
      "Mobile_Number": "6395203201"
    }
  ]
}`}
              />
              <ApiEndpoint
                method="GET"
                path="/students/:class_number"
                description="Retrieves a list of all students belonging to a specific class."
                response={`[
  {
    "Name": "Prakhar Doneria",
    "Class_Number": "2C",
    "Roll_Number": "2400900100104",
    "Mobile_Number": "6395203201"
  }
]`}
              />
              <ApiEndpoint
                method="GET"
                path="/students/:roll_number/attendance"
                description="Fetches all attendance records for a specific student."
                response={`{
  "student": { ... },
  "attendanceRecords": [
    {
      "Date": "20-09-2025",
      "DSTL": "Present",
      "Class_Number": "2C"
    }
  ]
}`}
              />
              <ApiEndpoint
                method="GET"
                path="/students/:roll_number/attendance-summary"
                description="Provides a summary of a student's attendance, including overall percentage and subject-wise breakdown."
                response={`{
  "student": { ... },
  "summary": {
    "totalDays": 10,
    "presentDays": 8,
    "overallPercentage": "80.00%",
    "subjects": {
      "DSTL": { "totalClasses": 5, "present": 4, "percentage": "80.00%" }
    }
  }
}`}
              />
            </Accordion>
          </CardContent>
        </Card>

        {/* Faculty Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck /> Faculty Routes
            </CardTitle>
            <CardDescription>Endpoints for faculty members to manage attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <ApiEndpoint
                method="POST"
                path="/faculty/mark_attendance"
                description="Marks attendance for multiple students for a specific subject and class on the current date."
                request={`[
  {
    "Roll_Number": "2400900100104",
    "Name": "Prakhar Doneria",
    "Status": "Present",
    "Subject_Code": "DSTL",
    "Class_Number": "2C"
  }
]`}
                response={`{ "message": "Attendance marked!" }`}
              />
               <ApiEndpoint
                method="GET"
                path="/faculty/dayExcel/:class_number?date=DD-MM-YYYY"
                description="Downloads an Excel file with the daily attendance for a specific class and date."
                response={`(Initiates a file download of 'attendance.xlsx')`}
              />
            </Accordion>
          </CardContent>
        </Card>

        {/* Admin Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield /> Admin Routes
            </CardTitle>
            <CardDescription>Administrative endpoints for system maintenance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
               <ApiEndpoint
                method="GET"
                path="/admin/cleardub"
                description="Removes duplicate student records from the database based on roll number."
                response={`{ "message": "Duplicates cleared", "removed_count": 3 }`}
              />
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    