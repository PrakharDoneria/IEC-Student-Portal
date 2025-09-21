'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudentAttendanceSummary } from '@/app/actions';
import type { StudentAttendanceSummary } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

export function AttendanceCalculator() {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetPercentage, setTargetPercentage] = useState(75);
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

  const calculateRequiredClasses = (
    present: number,
    total: number,
    target: number
  ) => {
    if (target >= 100) return Infinity;
    const currentPercentage = total > 0 ? (present / total) * 100 : 100;
    if (currentPercentage >= target) {
      return 0; // Already above target
    }
    // Formula: x >= (target * total - 100 * present) / (100 - target)
    const required = Math.ceil(
      (target * total - 100 * present) / (100 - target)
    );
    return required > 0 ? required : 0;
  };

  if (loading || !summary) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-32 w-full max-w-lg mx-auto" />
        <Skeleton className="h-64 w-full max-w-lg mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target /> Attendance Goal Calculator
          </CardTitle>
          <CardDescription>
            See how many classes you need to attend to reach your attendance
            goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="target-percentage">Target Percentage (%)</Label>
              <Input
                id="target-percentage"
                type="number"
                value={targetPercentage}
                onChange={(e) =>
                  setTargetPercentage(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                max={99}
                min={1}
                className="text-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Subjects:</h3>
            {Object.entries(summary.summary.subjects).map(
              ([subjectCode, subjectData]) => {
                const requiredClasses = calculateRequiredClasses(
                  subjectData.present,
                  subjectData.totalClasses,
                  targetPercentage
                );
                const currentPercentage = subjectData.totalClasses > 0 ? parseFloat(subjectData.percentage) : 100;

                return (
                  <Card key={subjectCode} className="p-4">
                    <div className="flex justify-between items-center">
                        <div className='flex-1'>
                            <p className="font-bold text-md">{subjectCode}</p>
                            <p className="text-sm text-muted-foreground">
                            Current: {currentPercentage.toFixed(2)}% ({subjectData.present} / {subjectData.totalClasses})
                            </p>
                        </div>

                      <div className="text-right">
                        {requiredClasses === 0 && currentPercentage >= targetPercentage ? (
                          <div className="flex items-center gap-2 text-accent">
                            <TrendingUp size={18} />
                            <span>Goal Achieved!</span>
                          </div>
                        ) : requiredClasses === Infinity ? (
                           <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle size={18} />
                            <span>100% is not possible</span>
                          </div>
                        ) :
                        (
                          <p>
                            Attend next{' '}
                            <span className="font-bold text-primary text-lg">
                              {requiredClasses}
                            </span>{' '}
                            classes
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
