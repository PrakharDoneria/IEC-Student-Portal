'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const FACULTY_SECURITY_CODE = 'Attend@IEC@ieccollege.com';

export default function FacultyLoginPage() {
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('facultyAccessCode') === FACULTY_SECURITY_CODE) {
      router.push('/faculty/dashboard');
    }
  }, [router]);

  const handleFacultyLogin = () => {
    setLoading(true);
    if (securityCode === FACULTY_SECURITY_CODE) {
      localStorage.setItem('facultyAccessCode', securityCode);
      toast({
        title: 'Access Granted',
        description: 'Welcome, faculty member!',
      });
      router.push('/faculty/dashboard');
    } else {
      toast({
        title: 'Access Denied',
        description: 'The provided security code is incorrect.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

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
        <h1 className="text-3xl font-bold font-headline">Faculty Access</h1>
        <p className="text-muted-foreground">Enter your security code to proceed.</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Security Check</CardTitle>
          <CardDescription>
            This area is restricted to authorized faculty members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="security-code">Security Code</Label>
            <Input
              id="security-code"
              type="password"
              placeholder="Enter your code"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFacultyLogin()}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className='flex-col gap-4'>
          <Button onClick={handleFacultyLogin} disabled={loading} className="w-full">
            {loading ? 'Verifying...' : 'Grant Access'}
          </Button>
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to Student Login
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
