"use client";

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { StudentAttendanceSummaryView } from '@/components/student-attendance-summary';
import type { Student } from '@/lib/types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type StudentRosterProps = {
  students: Student[];
  selectedClassId: string;
};

export function StudentRoster({
  students,
  selectedClassId,
}: StudentRosterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [classId, setClassId] = useState(selectedClassId);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleViewRoster = () => {
    if (!classId) {
      toast({ title: 'Error', description: 'Please enter a class ID.', variant: 'destructive' });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('class', classId);
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(
      (student) =>
        student.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.Roll_Number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl items-end">
            <div className="space-y-2">
              <Label htmlFor="class-input">Class ID</Label>
              <Input 
                id="class-input" 
                placeholder="e.g., 2C" 
                value={classId} 
                onChange={(e) => setClassId(e.target.value)} 
              />
            </div>
            <Button onClick={handleViewRoster} className="w-full md:w-auto">
              View Roster
            </Button>
            <div className="w-full md:col-start-3">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead className="text-right">View Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow
                      key={student._id}
                      onClick={() => handleRowClick(student)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={student.avatarUrl}
                            alt={student.Name}
                            data-ai-hint="student portrait"
                          />
                          <AvatarFallback>
                            {student.Name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{student.Name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.Roll_Number}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        Click to view
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {selectedClassId ? `No students found for class "${selectedClassId}".` : 'Enter a class ID to view the roster.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent className="sm:max-w-2xl w-full p-0">
          {selectedStudent && <StudentAttendanceSummaryView student={selectedStudent} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
