'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudentAttendanceSummary } from '@/app/actions';
import type { StudentAttendanceSummary } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Hash, School } from 'lucide-react';

export function StudentProfileView() {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const rollNumber = localStorage.getItem('studentRollNumber');
    if (!rollNumber) {
      router.push('/');
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      const result = await getStudentAttendanceSummary(rollNumber);
      if (result.success) {
        setSummary(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        localStorage.removeItem('studentRollNumber');
        router.push('/');
      }
      setLoading(false);
    };

    fetchSummary();
  }, [router, toast]);

  if (loading || !summary) {
    return (
      <div className="p-4 md:p-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student } = summary;

  return (
    <div className="p-4 md:p-6">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center bg-card-foreground/5 p-8">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
            <AvatarFallback className="text-4xl">
              {student.Name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-bold">{student.Name}</h2>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <InfoRow icon={<Hash size={20} />} label="Roll Number" value={student.Roll_Number} />
          <InfoRow icon={<School size={20} />} label="Class" value={student.Class_Number} />
          <InfoRow icon={<Phone size={20} />} label="Mobile Number" value={student.Mobile_Number} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 text-lg">
            <div className="text-muted-foreground">{icon}</div>
            <div className="font-medium">{label}:</div>
            <div className="text-foreground">{value}</div>
        </div>
    )
}
