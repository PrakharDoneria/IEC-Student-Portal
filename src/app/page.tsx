'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { IecLogo } from '@/components/icons';
import { getStudentAttendanceSummary } from './actions';

export default function LoginPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedRollNumber = localStorage.getItem('studentRollNumber');
    if (storedRollNumber) {
      router.push('/summary');
    }
  }, [router]);

  const handleLogin = async () => {
    if (!rollNumber) {
      toast({
        title: 'Roll Number Required',
        description: 'Please enter your roll number to proceed.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    const result = await getStudentAttendanceSummary(rollNumber);
    if (result.success) {
      localStorage.setItem('studentRollNumber', rollNumber);
      toast({
        title: 'Login Successful',
        description: `Welcome, ${result.data.student.Name}!`,
      });
      router.push('/summary');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center mb-8">
        <IecLogo className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold font-headline">IEC Student Portal</h1>
        <p className="text-muted-foreground">Your attendance, simplified.</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Enter your university roll number to view your attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="roll-number">Roll Number</Label>
            <Input
              id="roll-number"
              placeholder="e.g., 2400900100104"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? 'Verifying...' : 'View My Attendance'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
