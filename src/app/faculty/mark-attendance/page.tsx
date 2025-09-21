
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { fetchStudentsForClass, markAttendance } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Student, AttendanceMarking } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const attendanceFormSchema = z.object({
  year: z.string({ required_error: 'Please select a year.' }),
  section: z.string({ required_error: 'Please select a section.' }),
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
    const { year, section, subjectCode } = form.getValues();
    if (!year || !section) {
      toast({ title: 'Please select a year and section.', variant: 'destructive' });
      return;
    }
     if (!subjectCode) {
      toast({ title: 'Please enter a subject name.', variant: 'destructive' });
      return;
    }
    
    const classId = `${year}${section}`;

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
    form.reset({ year: undefined, section: undefined, subjectCode: '', students: [] });
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={students.length > 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={students.length > 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(c => <SelectItem key={c} value={c}>Section {c}</SelectItem>)}
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
                {/* Desktop Table */}
                <div className="border rounded-md hidden md:block">
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
                             <Controller
                              control={form.control}
                              name={`students.${index}.status`}
                              render={({ field: { onChange, value } }) => (
                                <div className="flex items-center justify-end gap-2">
                                  <FormLabel htmlFor={`status-switch-${index}`} className={cn("font-normal cursor-pointer", value === 'Absent' && 'text-muted-foreground')}>Absent</FormLabel>
                                  <Switch
                                    id={`status-switch-${index}`}
                                    checked={value === 'Present'}
                                    onCheckedChange={(checked) => onChange(checked ? 'Present' : 'Absent')}
                                  />
                                  <FormLabel htmlFor={`status-switch-${index}`} className={cn("font-normal cursor-pointer", value === 'Present' && 'text-accent')}>Present</FormLabel>
                                </div>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                       <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{students[index].Name}</p>
                            <p className="text-sm text-muted-foreground">{students[index].Roll_Number}</p>
                          </div>
                          <Controller
                              control={form.control}
                              name={`students.${index}.status`}
                              render={({ field: { onChange, value } }) => (
                                <div className="flex items-center gap-2">
                                   <FormLabel htmlFor={`status-switch-mobile-${index}`} className={cn("font-normal cursor-pointer text-sm", value === 'Absent' && 'text-muted-foreground')}>Absent</FormLabel>
                                  <Switch
                                    id={`status-switch-mobile-${index}`}
                                    checked={value === 'Present'}
                                    onCheckedChange={(checked) => onChange(checked ? 'Present' : 'Absent')}
                                  />
                                  <FormLabel htmlFor={`status-switch-mobile-${index}`} className={cn("font-normal cursor-pointer text-sm", value === 'Present' && 'text-accent')}>Present</FormLabel>
                                </div>
                              )}
                            />
                       </div>
                    </Card>
                  ))}
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
