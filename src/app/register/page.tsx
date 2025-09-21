

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addStudent } from '@/app/actions';
import type { NewStudent } from '@/lib/types';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  year: z.string({ required_error: 'Please select a year.' }),
  section: z.string({ required_error: 'Please select a section.' }),
  roll_number: z.string().min(5, { message: 'A valid roll number is required.' }),
  mobile_number: z.string().regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits.' }),
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('hasRegistered')) {
      setIsAlreadyRegistered(true);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      roll_number: '',
      mobile_number: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    const studentData: NewStudent = {
      name: values.name,
      class: `${values.year}${values.section}`,
      roll_number: values.roll_number,
      mobile_number: values.mobile_number,
    };

    const result = await addStudent(studentData);
    if (result.success) {
      localStorage.setItem('hasRegistered', 'true');
      toast({
        title: 'Registration Successful',
        description: `Student ${result.data.Name} has been added.`,
      });
      router.push('/');
    } else {
      toast({
        title: 'Registration Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm mx-auto mb-4">
        <Image 
          src="/logo.png" 
          alt="College Banner" 
          width={475} 
          height={90} 
          className="w-full h-auto object-contain"
          priority
        />
      </div>
       <div className="flex flex-col items-center mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">New Student Registration</h1>
        <p className="text-muted-foreground">Enter the details to add a new student.</p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register Student</CardTitle>
          <CardDescription>
            Fill out the form below to create a new student record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAlreadyRegistered ? (
            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold">Registration Limit Reached</h3>
                <p className="text-muted-foreground text-sm">
                    Only one student can be registered per device.
                </p>
                 <Button asChild variant="link" className="mt-4">
                    <Link href="/">Go to Login</Link>
                </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(sec => (
                                <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="roll_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2400900100104" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Registering...' : 'Register Student'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
         <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-muted-foreground">
              Already registered?{' '}
              <Link href="/" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
        </CardFooter>
      </Card>
    </main>
  );
}
