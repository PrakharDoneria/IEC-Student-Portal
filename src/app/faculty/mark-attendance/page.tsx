
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fetchStudentsForClass, markAttendance } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Student, AttendanceMarking } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const attendanceFormSchema = z.object({
  classId: z.string({ required_error: 'Please select a class.' }),
  subjectCode: z.string().min(1, 'Subject name cannot be empty.'),
  students: z.array(z.object({
    rollNumber: z.string(),
    name: z.string(),
    status: z.enum(['Present', 'Absent'], { required_error: 'Please mark status.' }),
  })),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

export default function MarkAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      students: [],
      subjectCode: '',
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'students',
  });

  const handleFetchStudents = async () => {
    const { classId, subjectCode } = form.getValues();
    if (!classId) {
      toast({ title: 'Please select a class first.', variant: 'destructive' });
      return;
    }
     if (!subjectCode) {
      toast({ title: 'Please enter a subject name.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setStudents([]);
    replace([]);

    const result = await fetchStudentsForClass(classId);
    if (result.success) {
      setStudents(result.data);
      const studentFields = result.data.map(s => ({ rollNumber: s.Roll_Number, name: s.Name, status: 'Present' as const }));
      replace(studentFields);
      setSelectedClass(classId);
      setSelectedSubject(subjectCode);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setLoading(false);
  };
  
  async function onSubmit(data: AttendanceFormValues) {
    if (!selectedClass || !selectedSubject) {
      toast({ title: 'Something went wrong', description: 'Class or Subject not selected.', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    const attendanceData: AttendanceMarking[] = data.students.map(student => ({
      Roll_Number: student.rollNumber,
      Name: student.name,
      Status: student.status,
      Subject_Code: selectedSubject.toUpperCase(), // Send subject code in uppercase
      Class_Number: selectedClass,
    }));
    
    const result = await markAttendance(attendanceData);

    if (result.success) {
      toast({ title: 'Success', description: 'Attendance has been marked successfully.' });
      resetFormState();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setSubmitting(false);
  }

  const resetFormState = () => {
    setStudents([]);
    replace([]);
    form.reset({ classId: undefined, subjectCode: '', students: [] });
    setSelectedClass(null);
    setSelectedSubject(null);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Select a class and subject to mark daily attendance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={students.length > 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['2A', '2B', '2C', '2D', '2E', '2F', '2G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjectCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                       <FormControl>
                          <Input placeholder="e.g., DSTL or B.Tech" {...field} disabled={students.length > 0} />
                       </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={handleFetchStudents} disabled={loading || students.length > 0}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</> : 'Fetch Students'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {students.length > 0 && (
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Student List</CardTitle>
                    <CardDescription>Mark each student as Present or Absent for {selectedSubject} in class {selectedClass}.</CardDescription>
                  </div>
                  <Button variant='outline' type="button" onClick={resetFormState}>Change Class/Subject</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>{students[index].Roll_Number}</TableCell>
                          <TableCell>{students[index].Name}</TableCell>
                          <TableCell className="text-right">
                            <FormField
                              control={form.control}
                              name={`students.${index}.status`}
                              render={({ field }) => (
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex justify-end gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Present" id={`present-${index}`} />
                                      </FormControl>
                                      <FormLabel htmlFor={`present-${index}`} className={cn("font-normal cursor-pointer", field.value === 'Present' && 'text-accent')}>Present</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Absent" id={`absent-${index}`} />
                                      </FormControl>
                                      <FormLabel htmlFor={`absent-${index}`} className={cn("font-normal cursor-pointer", field.value === 'Absent' && 'text-destructive')}>Absent</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button type="submit" disabled={submitting} className="w-full md:w-auto mt-6">
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Attendance'}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
