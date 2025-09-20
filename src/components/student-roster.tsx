"use client";

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { StudentAttendanceSummaryView } from '@/components/student-attendance-summary';
import type { Class, Student } from '@/lib/types';
import { Input } from './ui/input';

type StudentRosterProps = {
  classes: Class[];
  students: Student[];
  selectedClassId: string;
};

export function StudentRoster({
  classes,
  students,
  selectedClassId,
}: StudentRosterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClassChange = (classId: string) => {
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
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={selectedClassId} onValueChange={handleClassChange}>
                <SelectTrigger className="w-[280px]">
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
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[250px]"
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
                      key={student.id}
                      onClick={() => handleRowClick(student)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={student.avatarUrl}
                            alt={student.name}
                            data-ai-hint="student portrait"
                          />
                          <AvatarFallback>
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.rollNumber}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        Click to view
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No students found for this class or search term.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent className="sm:max-w-xl w-full p-0">
          {selectedStudent && <StudentAttendanceSummaryView student={selectedStudent} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
