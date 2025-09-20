"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getStudentAttendanceSummary } from '@/app/actions';
import type { Student, StudentAttendanceSummary } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

type StudentAttendanceSummaryViewProps = {
  student: Student;
};

const chartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(var(--accent))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export function StudentAttendanceSummaryView({ student }: StudentAttendanceSummaryViewProps) {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const result = await getStudentAttendanceSummary(student.id);
      if (result.success) {
        setSummary(result.data);
      }
      setLoading(false);
    };

    fetchSummary();
  }, [student.id]);

  const attendancePercentage = summary
    ? summary.totalClasses > 0
      ? (summary.presentCount / summary.totalClasses) * 100
      : 0
    : 0;

  const chartData = summary
    ? [
        { name: 'Present', value: summary.presentCount, fill: 'var(--color-present)' },
        { name: 'Absent', value: summary.absentCount, fill: 'var(--color-absent)' },
      ]
    : [];

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="student portrait" />
              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-bold">{student.name}</SheetTitle>
              <SheetDescription>
                Roll No: {student.rollNumber}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {loading ? (
          <SummarySkeleton />
        ) : summary ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="col-span-1 flex items-center justify-center">
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
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={40}
                            strokeWidth={5}
                          >
                            {chartData.map((entry) => (
                              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-3xl font-bold">
                        {attendancePercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-3xl font-bold text-accent">
                        {summary.presentCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Present</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-3xl font-bold text-destructive">
                        {summary.absentCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Absent</div>
                    </Card>
                     <Card className="flex flex-col items-center justify-center p-4">
                      <div className="text-3xl font-bold">
                        {summary.totalClasses}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Classes</div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent History</CardTitle>
                <CardDescription>Last 20 records</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.records.slice(0, 20).map((record) => (
                        <TableRow key={record.date}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                record.status === 'present'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={record.status === 'present' ? 'bg-accent' : ''}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>
        ) : (
          <p>No attendance summary available for this student.</p>
        )}
      </div>
    </ScrollArea>
  );
}


function SummarySkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-1 flex items-center justify-center">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
