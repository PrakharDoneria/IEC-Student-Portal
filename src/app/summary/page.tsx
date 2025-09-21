import { StudentAttendanceSummaryView } from '@/components/student-attendance-summary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function SummaryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 flex flex-col">
         <Image 
            src="/logo.png" 
            alt="College Banner" 
            width={1200} 
            height={100} 
            className="w-full object-contain"
            priority
          />
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-headline">
              My Attendance
            </h1>
          </div>
          <Button variant="outline" asChild>
              <Link href="/">Logout</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <StudentAttendanceSummaryView />
      </main>
    </div>
  );
}
