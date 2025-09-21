"use client";

import { useState, useTransition } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchStudentsForClass, submitAttendance } from '@/app/actions';
import { Loader2 } from 'lucide-react';

type FormValues = {
  attendance: {
    Roll_Number: string;
    Name: string;
    avatarUrl: string;
    Status: 'Present' | 'Absent';
  }[];
};

export function AttendanceMarker() {
  const [classId, setClassId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
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
    if (!classId) {
      toast({ title: 'Error', description: 'Please enter a class ID.', variant: 'destructive' });
      return;
    }

    startLoading(async () => {
      const result = await fetchStudentsForClass(classId);
      if (result.success && result.data) {
        const students = result.data.map(student => ({
          Roll_Number: student.Roll_Number,
          Name: student.Name,
          avatarUrl: student.avatarUrl,
          Status: 'Present' as const, // Default to present
        }));
        replace(students);
        if (students.length > 0) {
            toast({ title: 'Success', description: 'Roster loaded.' });
        } else {
            toast({ title: 'No Students', description: 'No students found for this class.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        replace([]);
      }
    });
  };

  const onSubmit = (data: FormValues) => {
    if (!classId || !subject) {
        toast({ title: 'Error', description: 'Please enter a class and subject.', variant: 'destructive' });
        return;
    }

    startSubmitting(async () => {
      const payload = data.attendance.map(({ Roll_Number, Name, Status }) => ({ Roll_Number, Name, Status }));
      const result = await submitAttendance(classId, subject, payload);
      if (result.success) {
        toast({ title: 'Attendance Submitted', description: result.message });
      } else {
        toast({ title: 'Submission Failed', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enter Class & Subject</CardTitle>
          <CardDescription>Enter a class ID and subject to mark attendance, then load the roster.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl items-end">
              <div className="space-y-2">
                <Label htmlFor="class-input">Class ID</Label>
                <Input id="class-input" placeholder="e.g., 2C" value={classId} onChange={(e) => setClassId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-input">Subject Code</Label>
                <Input id="subject-input" placeholder="e.g., DSTL" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <Button onClick={handleLoadRoster} disabled={isLoading || !classId}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load Roster
              </Button>
            </div>
        </CardContent>
      </Card>
      
      {isLoading && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />}

      {!isLoading && fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Mark each student as present or absent for {subject}.</CardDescription>
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
                              <AvatarImage src={field.avatarUrl} alt={field.Name} data-ai-hint="student portrait" />
                              <AvatarFallback>{field.Name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="font-medium">{field.Name}</span>
                                <p className="text-xs text-muted-foreground">{field.Roll_Number}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Controller
                            control={form.control}
                            name={`attendance.${index}.Status`}
                            render={({ field: controllerField }) => (
                              <RadioGroup
                                onValueChange={controllerField.onChange}
                                defaultValue={controllerField.value}
                                className="flex justify-end gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Present" id={`present-${index}`} className="text-accent" />
                                  <Label htmlFor={`present-${index}`}>Present</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Absent" id={`absent-${index}`} className="text-destructive" />
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
                <Button type="submit" disabled={isSubmitting || !subject}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Attendance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isLoading && fields.length === 0 && classId && (
         <Card>
            <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">Roster has been loaded, but no students were found for the selected class.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
