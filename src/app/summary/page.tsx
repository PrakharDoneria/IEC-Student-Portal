import { StudentAttendanceSummaryView } from '@/components/student-attendance-summary';
import { IecLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SummaryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <IecLogo className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">
            My Attendance
          </h1>
        </div>
         <Button variant="outline" asChild>
            <Link href="/">Logout</Link>
        </Button>
      </header>
      <main className="flex-1">
        <StudentAttendanceSummaryView />
      </main>
    </div>
  );
}
