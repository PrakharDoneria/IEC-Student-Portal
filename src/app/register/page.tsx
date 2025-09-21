
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
import { useToast } from '@/hooks/use-toast';
import { addStudent } from '@/app/actions';
import type { NewStudent } from '@/lib/types';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  class: z.string().min(1, { message: 'Class is required.' }),
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
      class: '',
      roll_number: '',
      mobile_number: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const result = await addStudent(values);
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
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2C" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
