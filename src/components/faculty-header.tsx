
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { LogOut, LayoutDashboard, PenSquare, FileDown, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';

const FACULTY_SECURITY_CODE = 'Attend@IEC@ieccollege.com';

const navLinks = [
    { href: '/faculty/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { href: '/faculty/mark-attendance', label: 'Mark Attendance', icon: <PenSquare /> },
    { href: '/faculty/export-excel', label: 'Export Reports', icon: <FileDown /> }
];

export function FacultyHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const facultyAccessCode = localStorage.getItem('facultyAccessCode');
    if (facultyAccessCode !== FACULTY_SECURITY_CODE) {
      if (pathname !== '/faculty/login') {
        router.replace('/faculty/login');
      }
    } else {
      if (pathname === '/faculty/login') {
        router.replace('/faculty/dashboard');
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('facultyAccessCode');
    router.push('/faculty/login');
  };

  // Don't render header on the faculty login page
  if (pathname === '/faculty/login') return null;

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/faculty/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="College Banner"
              width={120}
              height={24}
              className="object-contain"
              priority
            />
            <span className="font-bold text-lg text-muted-foreground hidden md:inline">Faculty Portal</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
                 <Button key={link.href} variant={pathname === link.href ? 'secondary' : 'ghost'} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                        {link.icon}
                        {link.label}
                    </Link>
                </Button>
            ))}
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
                <LogOut />
                Logout
            </Button>
          </nav>
          
          {/* Mobile Navigation Trigger */}
          <div className='md:hidden'>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle className='flex items-center gap-2'>
                             <Image
                                src="/logo.png"
                                alt="College Banner"
                                width={120}
                                height={24}
                                className="object-contain"
                                priority
                            />
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col h-full py-4">
                        <nav className="flex flex-col gap-2 flex-1">
                            {navLinks.map(link => (
                                <SheetClose key={link.href} asChild>
                                    <Button variant={pathname === link.href ? 'secondary' : 'ghost'} asChild className='justify-start'>
                                        <Link href={link.href} className="flex items-center gap-4">
                                            {link.icon}
                                            {link.label}
                                        </Link>
                                    </Button>
                                </SheetClose>
                            ))}
                             <div className="flex justify-between items-center p-2">
                                <span>Switch Theme</span>
                                <ThemeToggle />
                             </div>
                        </nav>
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut />
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
