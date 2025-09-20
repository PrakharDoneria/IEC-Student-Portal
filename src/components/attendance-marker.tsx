"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { fetchStudentsForClass, submitAttendance } from '@/app/actions';
import type { Class, Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type FormValues = {
  attendance: {
    studentId: string;
    studentName: string;
    avatarUrl: string;
    status: 'present' | 'absent';
  }[];
};

export function AttendanceMarker({ classes }: { classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(classes[0]?.id);
  const [isLoading, startLoading] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      attendance: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'attendance',
  });

  const handleLoadRoster = () => {
    if (!selectedClassId) {
      toast({ title: 'Error', description: 'Please select a class first.', variant: 'destructive' });
      return;
    }

    startLoading(async () => {
      const result = await fetchStudentsForClass(selectedClassId);
      if (result.success && result.data) {
        const students = result.data.map(student => ({
          studentId: student.id,
          studentName: student.name,
          avatarUrl: student.avatarUrl,
          status: 'present' as const, // Default to present
        }));
        replace(students);
        toast({ title: 'Success', description: 'Roster loaded.' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        replace([]);
      }
    });
  };

  useEffect(() => {
    // Automatically load roster when a class is selected
    if (selectedClassId) {
      handleLoadRoster();
    } else {
      replace([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);


  const onSubmit = (data: FormValues) => {
    if (!selectedClassId) return;

    startSubmitting(async () => {
      const payload = data.attendance.map(({ studentId, status }) => ({ studentId, status }));
      const result = await submitAttendance(selectedClassId, payload);
      if (result.success) {
        toast({ title: 'Attendance Submitted', description: result.message });
        replace([]); // Clear the form
      } else {
        toast({ title: 'Submission Failed', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose a class to load the student roster for attendance marking.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="class-select">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </CardContent>
      </Card>
      
      {isLoading && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />}

      {!isLoading && fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Mark each student as present or absent.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Mark Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={field.avatarUrl} alt={field.studentName} data-ai-hint="student portrait" />
                              <AvatarFallback>{field.studentName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{field.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Controller
                            control={form.control}
                            name={`attendance.${index}.status`}
                            render={({ field: controllerField }) => (
                              <RadioGroup
                                onValueChange={controllerField.onChange}
                                defaultValue={controllerField.value}
                                className="flex justify-end gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="present" id={`present-${index}`} className="text-accent" />
                                  <Label htmlFor={`present-${index}`}>Present</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="absent" id={`absent-${index}`} className="text-destructive" />
                                  <Label htmlFor={`absent-${index}`}>Absent</Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Attendance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
