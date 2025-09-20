import { getClasses } from '@/lib/data';
import { AttendanceMarker } from '@/components/attendance-marker';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AttendancePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-6 border-b bg-card">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Mark Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Use AI to pre-fill attendance, then review and submit.
        </p>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <Suspense fallback={<AttendanceSkeleton />}>
          <AttendanceDataWrapper />
        </Suspense>
      </main>
    </div>
  );
}

async function AttendanceDataWrapper() {
  const classes = await getClasses();
  return <AttendanceMarker classes={classes} />;
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
       <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
