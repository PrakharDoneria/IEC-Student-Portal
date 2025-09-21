
'use client'

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.API_BASE_URL;

export default function ExportExcelPage() {
  const [classId, setClassId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleDownload = () => {
    if (!classId) {
      toast({ title: "Please select a class.", variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Please select a date.", variant: "destructive" });
      return;
    }
     if (!API_BASE_URL) {
      toast({ title: "API URL not configured. Cannot download.", variant: "destructive" });
      return;
    }

    const formattedDate = format(date, 'dd-MM-yyyy');
    const downloadUrl = `${API_BASE_URL}/faculty/dayExcel/${classId}?date=${formattedDate}`;
    
    // Use a temporary anchor tag to trigger the download
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.click();

    toast({
        title: "Download Initiated",
        description: `Your Excel export for class ${classId} on ${formattedDate} has started.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Export Attendance Report</CardTitle>
          <CardDescription>
            Download the daily attendance report for a specific class as an Excel file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
                <Label>Class</Label>
                <Select onValueChange={setClassId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                        {['2A', '2B', '2C', '2D', '2E', '2F', '2G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
          <Button onClick={handleDownload} className="w-full md:w-auto">
            <Download className="mr-2" />
            Download Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
