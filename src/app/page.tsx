import { getClasses, getStudentsByClass } from '@/lib/data';
import { StudentRoster } from '@/components/student-roster';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Class, Student } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { class?: string };
}) {
  const classes = await getClasses();
  const selectedClassId = searchParams.class || (classes[0]?.id ?? '');

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-6 border-b bg-card">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Student Roster
        </h1>
        <p className="text-muted-foreground mt-1">
          Select a class to view student details and attendance summaries.
        </p>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <Suspense fallback={<RosterSkeleton />}>
          <RosterDataWrapper selectedClassId={selectedClassId} classes={classes} />
        </Suspense>
      </main>
    </div>
  );
}

async function RosterDataWrapper({ selectedClassId, classes }: { selectedClassId: string; classes: Class[] }) {
  const students = await getStudentsByClass(selectedClassId);
  return <StudentRoster classes={classes} students={students} selectedClassId={selectedClassId} />;
}

function RosterSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="border rounded-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}