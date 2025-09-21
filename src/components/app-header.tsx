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
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Menu, User, Calculator, LayoutDashboard, LogOut } from 'lucide-react';

type NavLink = {
    href: string;
    label: string;
    icon: React.ReactNode;
}

export function AppHeader() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { href: '/summary', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/profile', label: 'My Profile', icon: <User size={18} /> },
    { href: '/calculator', label: 'Calculator', icon: <Calculator size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
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
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
                 <Button key={link.href} variant={pathname === link.href ? 'secondary': 'ghost'} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                        {link.icon}
                        {link.label}
                    </Link>
                </Button>
            ))}
            <Button variant="outline" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
            </Button>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                   <div className='pb-4 border-b'>
                        <p className='font-bold text-lg'>{studentName || 'Student'}</p>
                        <p className='text-sm text-muted-foreground'>IEC Student Portal</p>
                   </div>
                  {navLinks.map(link => (
                     <Button key={link.href} variant={pathname === link.href ? 'secondary': 'ghost'} asChild onClick={() => setIsMenuOpen(false)}>
                        <Link href={link.href} className="flex items-center gap-2 justify-start">
                             {link.icon}
                             {link.label}
                        </Link>
                    </Button>
                  ))}
                  <Button variant="destructive" onClick={handleLogout}>
                     <LogOut size={18} />
                     Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
