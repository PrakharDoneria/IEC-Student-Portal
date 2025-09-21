"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getStudentAttendanceSummary } from '@/app/actions';
import type { StudentAttendanceSummary } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const chartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(var(--accent))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--destructive))',
  },
  percentage: {
    label: 'Percentage',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function StudentAttendanceSummaryView() {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const rollNumber = localStorage.getItem('studentRollNumber');
    if (!rollNumber) {
      toast({
        title: 'Not logged in',
        description: 'Redirecting to login page.',
        variant: 'destructive',
      });
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
          variant: 'destructive'
        });
        // Clear broken roll number and redirect
        localStorage.removeItem('studentRollNumber');
        router.push('/');
      }
      setLoading(false);
    };

    fetchSummary();
  }, [router, toast]);

  const pieChartData = summary
    ? [
        { name: 'Present', value: summary.summary.presentDays, fill: 'var(--color-present)' },
        { name: 'Absent', value: summary.summary.totalDays - summary.summary.presentDays, fill: 'var(--color-absent)' },
      ]
    : [];

  const barChartData = summary ? Object.entries(summary.summary.subjects).map(([subjectCode, subjectData]) => ({
    name: subjectCode,
    percentage: parseFloat(subjectData.percentage),
    present: subjectData.present,
    total: subjectData.totalClasses,
  })) : [];
  
  const getStatusForSubject = (record: { Date: string; [key: string]: string }, subjectCode: string): string => {
    return record[subjectCode] || 'N/A';
  };

  if (loading) {
    return <SummarySkeleton />;
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <p>Could not load attendance summary. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{summary.student.Name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{summary.student.Name}</h2>
              <p className="text-muted-foreground text-sm">
                Roll No: {summary.student.Roll_Number} | Class: {summary.student.Class_Number}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-6">
                 <div className="w-full md:w-1/3 flex justify-center">
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square h-[150px]"
                    >
                      <ResponsiveContainer>
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={40}
                            strokeWidth={5}
                          >
                            {pieChartData.map((entry) => (
                              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="w-full md:w-2/3 grid grid-cols-2 gap-4 text-center">
                    <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-2xl font-bold">
                        {summary.summary.overallPercentage}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-2xl font-bold text-accent">
                        {summary.summary.presentDays}
                      </div>
                      <div className="text-sm text-muted-foreground">Present Lectures</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-2xl font-bold text-destructive">
                        {summary.summary.totalDays - summary.summary.presentDays}
                      </div>
                      <div className="text-sm text-muted-foreground">Absent</div>
                    </Card>
                     <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-2xl font-bold">
                        {summary.summary.totalDays}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Lectures</div>
                    </Card>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer>
                    <BarChart data={barChartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis domain={[0, 100]} unit="%" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="percentage" fill="var(--color-present)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent History</CardTitle>
                <CardDescription>Last 20 records</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md overflow-hidden">
                  <Table className="hidden md:table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        {barChartData.map(subject => (
                          <TableHead key={subject.name} className="text-center">{subject.name}</TableHead>

                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.attendanceRecords.slice(0, 20).map((record) => (
                        <TableRow key={record.Date}>
                          <TableCell className="font-medium">{record.Date}</TableCell>
                           {barChartData.map(subject => (
                            <TableCell key={subject.name} className="text-center">
                              <Badge
                                variant={getStatusForSubject(record, subject.name) === 'Present' ? 'default' : getStatusForSubject(record, subject.name) === 'Absent' ? 'destructive' : 'secondary'}
                                className={cn('w-20 justify-center', getStatusForSubject(record, subject.name) === 'Present' ? 'bg-accent' : '')}
                              >
                                {getStatusForSubject(record, subject.name)}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                   <div className="md:hidden">
                    {summary.attendanceRecords.slice(0, 20).map((record) => (
                        <div key={record.Date} className="border-b last:border-b-0 p-4">
                            <p className="font-bold mb-2">{record.Date}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {barChartData.map(subject => (
                                    <div key={subject.name} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{subject.name}</span>
                                        <Badge
                                            variant={getStatusForSubject(record, subject.name) === 'Present' ? 'default' : getStatusForSubject(record, subject.name) === 'Absent' ? 'destructive' : 'secondary'}
                                            className={cn('w-20 justify-center', getStatusForSubject(record, subject.name) === 'Present' ? 'bg-accent' : '')}
                                        >
                                            {getStatusForSubject(record, subject.name)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </ScrollArea>
  );
}


function SummarySkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/3 flex justify-center">
             <Skeleton className="h-[150px] w-[150px] rounded-full" />
          </div>
          <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
