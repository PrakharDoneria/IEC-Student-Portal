'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { getStudentAttendanceSummary } from '@/app/actions';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Menu, User, Calculator, LayoutDashboard, LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavLink = {
    href: string;
    label: string;
    icon: React.ReactNode;
}

export function AppHeader() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const rollNumber = localStorage.getItem('studentRollNumber');
    if (!rollNumber) {
      if (pathname !== '/') {
        router.replace('/');
      }
      setStudentName(null);
    } else {
       if (pathname === '/') {
          router.replace('/summary');
       }
      if (!studentName) {
        getStudentAttendanceSummary(rollNumber).then((result) => {
          if (result.success) {
            setStudentName(result.data.student.Name);
          } else {
            // Handle case where summary fetch fails but roll number exists
            localStorage.removeItem('studentRollNumber');
            router.replace('/');
          }
        });
      }
    }
  }, [pathname, router, studentName]);

  const handleLogout = () => {
    localStorage.removeItem('studentRollNumber');
    setStudentName(null);
    router.push('/');
  };
  
  // Don't render header on the login page
  if (pathname === '/') return null;


  const navLinks: NavLink[] = [
    { href: '/summary', label: 'Dashboard', icon: <LayoutDashboard /> },
    { href: '/profile', label: 'Profile', icon: <User /> },
    { href: '/calculator', label: 'Calculator', icon: <Calculator /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-card shadow-sm hidden md:block">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/summary" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="College Banner"
                width={120}
                height={24}
                className="object-contain"
                priority
              />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="flex items-center gap-4">
              {navLinks.map(link => (
                   <Button key={link.href} variant={pathname === link.href ? 'secondary': 'ghost'} asChild>
                      <Link href={link.href} className="flex items-center gap-2">
                          {link.icon}
                          {link.label}
                      </Link>
                  </Button>
              ))}
              <Button variant="outline" onClick={handleLogout}>
                  <LogOut />
                  Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <div className="flex justify-around h-16 items-center">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} passHref>
                    <Button variant='ghost' className={cn("flex flex-col h-full w-20 rounded-none", pathname === link.href ? 'text-primary' : 'text-muted-foreground')}>
                         {link.icon}
                         <span className='text-xs mt-1'>{link.label}</span>
                    </Button>
                </Link>
            ))}
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant='ghost' className="flex flex-col h-full w-20 rounded-none text-muted-foreground">
                        <MoreHorizontal />
                        <span className='text-xs mt-1'>More</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className='rounded-t-lg'>
                    <SheetHeader>
                        <SheetTitle>More Options</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 p-4">
                        <div className='pb-4 border-b text-center'>
                                <p className='font-bold text-lg'>{studentName || 'Student'}</p>
                                <p className='text-sm text-muted-foreground'>IEC Student Portal</p>
                        </div>
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut />
                            Logout
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </>
  );
}
