"use client";

import { useState, useTransition } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getAIAttendancePrediction, submitAttendance } from '@/app/actions';
import type { Class } from '@/lib/types';
import type { PrepareAttendanceWithAIOutput } from '@/ai/flows/prepare-attendance-with-ai';
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';

type FormValues = {
  attendance: {
    studentId: string;
    studentName: string;
    avatarUrl: string;
    predictedStatus?: 'present' | 'absent';
    confidence?: number;
    status: 'present' | 'absent';
  }[];
};

export function AttendanceMarker({ classes }: { classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(classes[0]?.id);
  const [externalFactors, setExternalFactors] = useState('');
  const [isPreparing, startPreparing] = useTransition();
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

  const handlePrepare = () => {
    if (!selectedClassId) {
      toast({ title: 'Error', description: 'Please select a class first.', variant: 'destructive' });
      return;
    }

    startPreparing(async () => {
      const result = await getAIAttendancePrediction(selectedClassId, externalFactors);
      if (result.success && result.data) {
        const studentMap = new Map(result.data.map(s => [s.studentId, s]));
        const aiStudents = result.data.map(student => {
           const studentDetails = studentMap.get(student.studentId);
           return {
              studentId: student.studentId,
              studentName: student.studentName,
              avatarUrl: `https://picsum.photos/seed/${student.studentId}/100/100`, // Assuming studentId can be a seed
              predictedStatus: student.predictedStatus,
              confidence: student.confidence,
              status: student.predictedStatus,
           }
        });
        replace(aiStudents);
        toast({ title: 'Success', description: 'AI has prepared the attendance sheet.' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

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
          <CardTitle>Setup Attendance</CardTitle>
          <CardDescription>Select a class and provide any external factors affecting attendance today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
              <Label htmlFor="external-factors">External Factors (Optional)</Label>
              <Input
                id="external-factors"
                placeholder="e.g., Public transport strike"
                value={externalFactors}
                onChange={(e) => setExternalFactors(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handlePrepare} disabled={isPreparing || !selectedClassId}>
            {isPreparing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Prepare with AI
          </Button>
        </CardContent>
      </Card>
      
      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Mark Attendance</CardTitle>
            <CardDescription>Review the AI's suggestions and make any necessary changes before submitting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>AI Prediction</TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {field.predictedStatus === 'present' ? <CheckCircle className="h-4 w-4 text-accent" /> : <XCircle className="h-4 w-4 text-destructive" />}
                            <span>{field.predictedStatus?.charAt(0).toUpperCase() + field.predictedStatus?.slice(1)}</span>
                            <span className="text-muted-foreground">({(field.confidence! * 100).toFixed(0)}%)</span>
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
