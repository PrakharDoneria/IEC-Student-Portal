
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
import { Menu, User, Calculator, LayoutDashboard, LogOut, MoreHorizontal, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type NavLink = {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function AppHeader() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (installPrompt) {
      setShowInstallButton(true);
    }
  }, [installPrompt]);

  useEffect(() => {
    const rollNumber = localStorage.getItem('studentRollNumber');
    if (!rollNumber) {
      // Allow access to public pages
      if (pathname !== '/' && pathname !== '/register' && !pathname.startsWith('/faculty')) {
        router.replace('/');
      }
      setStudentName(null);
    } else {
       if (pathname === '/' || pathname === '/register' || pathname.startsWith('/faculty')) {
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
  
  const handleInstallClick = async () => {
    if (!installPrompt) {
      // Fallback for browsers that don't support the prompt
       toast({
        title: "How to Install App",
        description: "To install the app, open your browser's menu and look for the 'Add to Home Screen' or 'Install App' option.",
        duration: 10000,
      });
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: 'Success', description: 'App installed successfully!' });
    }
    setInstallPrompt(null);
    setShowInstallButton(false);
  };
  
  // Don't render header on login, register, or faculty pages
  if (pathname === '/' || pathname === '/register' || pathname.startsWith('/faculty')) return null;


  const navLinks: NavLink[] = [
    { href: '/summary', label: 'Dashboard', icon: <LayoutDashboard /> },
    { href: '/profile', label: 'Profile', icon: <User /> },
    { href: '/calculator', label: 'Calculator', icon: <Calculator /> },
  ];

  const installButton = showInstallButton && (
      <Button variant="outline" onClick={handleInstallClick}>
          <Download />
          Install App
      </Button>
  );

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
              {installButton}
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
                         {installButton}
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut />
                            Logout
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
       {pathname === '/summary' && showInstallButton && (
        <Alert className="md:hidden m-4 mt-4">
          <Download className="h-4 w-4" />
          <AlertTitle>Get the App!</AlertTitle>
          <AlertDescription>
            For a better experience, add this app to your home screen.
            <Button variant="link" size="sm" onClick={handleInstallClick} className="p-0 h-auto ml-1">Install now</Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
