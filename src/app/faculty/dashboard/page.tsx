'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DoorOpen } from "lucide-react";

export default function FacultyDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen />
            Welcome to the Faculty Area
          </CardTitle>
          <CardDescription>
            This section is under construction. More features for faculty and admins will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>You have successfully accessed the restricted faculty section.</p>
          <p className="mt-4 text-muted-foreground">
            Available endpoints and features will be displayed here as they are developed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
