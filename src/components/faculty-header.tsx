'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';

const FACULTY_SECURITY_CODE = 'Attend@IEC@ieccollege.com';

export function FacultyHeader() {
  const router = useRouter();
  const pathname = usePathname();

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
            <span className="font-bold text-lg text-muted-foreground">Faculty Portal</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button variant={pathname === '/faculty/dashboard' ? 'secondary' : 'ghost'} asChild>
                <Link href="/faculty/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard />
                    Dashboard
                </Link>
            </Button>
            {/* Add more faculty nav links here */}
            <Button variant="outline" onClick={handleLogout}>
                <LogOut />
                Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
