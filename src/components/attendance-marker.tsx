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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchStudentsForClass, submitAttendance } from '@/app/actions';
import type { Class } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type FormValues = {
  attendance: {
    Roll_Number: string;
    Name: string;
    avatarUrl: string;
    Status: 'Present' | 'Absent';
  }[];
};

const subjects = [
    { id: 'DSTL', name: 'Data Structures & Algorithms' },
    { id: 'COA', name: 'Computer Organization & Architecture' },
    { id: 'DBMS', name: 'Database Management Systems' },
    { id: 'OS', name: 'Operating Systems' },
    { id: 'CN', name: 'Computer Networks' },
]

export function AttendanceMarker({ classes }: { classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(classes[0]?.id);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(subjects[0]?.id);
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
          Roll_Number: student.Roll_Number,
          Name: student.Name,
          avatarUrl: student.avatarUrl,
          Status: 'Present' as const, // Default to present
        }));
        replace(students);
        if (students.length > 0) {
            toast({ title: 'Success', description: 'Roster loaded.' });
        }
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        replace([]);
      }
    });
  };

  useEffect(() => {
    if (selectedClassId) {
      handleLoadRoster();
    } else {
      replace([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);


  const onSubmit = (data: FormValues) => {
    if (!selectedClassId || !selectedSubject) {
        toast({ title: 'Error', description: 'Please select a class and subject.', variant: 'destructive' });
        return;
    }

    startSubmitting(async () => {
      const payload = data.attendance.map(({ Roll_Number, Name, Status }) => ({ Roll_Number, Name, Status }));
      const result = await submitAttendance(selectedClassId, selectedSubject, payload);
      if (result.success) {
        toast({ title: 'Attendance Submitted', description: result.message });
        // Optionally clear the roster or keep it for review
        // replace([]); 
      } else {
        toast({ title: 'Submission Failed', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Subject</CardTitle>
          <CardDescription>Choose a class and subject to mark attendance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject-select">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
      </Card>
      
      {isLoading && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />}

      {!isLoading && fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Mark each student as present or absent for {selectedSubject}.</CardDescription>
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
                <Button type="submit" disabled={isSubmitting || !selectedSubject}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Attendance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isLoading && fields.length === 0 && selectedClassId &&(
         <Card>
            <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">No students found for the selected class.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
