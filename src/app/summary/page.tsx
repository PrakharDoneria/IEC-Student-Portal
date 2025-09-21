import { StudentAttendanceSummaryView } from '@/components/student-attendance-summary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function SummaryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 flex flex-col bg-card shadow-sm">
         <div className="w-full max-w-sm mx-auto p-2">
            <Image 
              src="/logo.png" 
              alt="College Banner" 
              width={475} 
              height={90} 
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        <div className="flex items-center justify-between p-4 border-b border-t">
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
