import { FacultyHeader } from '@/components/faculty-header';
import { Toaster } from '@/components/ui/toaster';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <FacultyHeader />
      <main className="flex-1 p-4 md:p-6">{children}</main>
      <Toaster />
    </div>
  );
}
