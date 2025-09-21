
'use client';

import Link from "next/link";
import { PenSquare, FileDown } from "lucide-react";

function HoneycombButton({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  return (
    <Link href={href} className="group relative w-40 h-44 flex items-center justify-center">
      <svg className="absolute w-full h-full text-card drop-shadow-lg group-hover:text-primary transition-colors" viewBox="0 0 100 115.47">
        <path d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" fill="currentColor" />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-card-foreground group-hover:text-primary-foreground">
        <Icon size={40} />
        <span className="mt-2 font-semibold">{label}</span>
      </div>
    </Link>
  )
}

export default function FacultyDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold">Faculty Portal</h1>
        <p className="text-muted-foreground text-lg">Select an action to proceed.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8">
        <HoneycombButton href="/faculty/mark-attendance" icon={PenSquare} label="Mark Attendance" />
        <HoneycombButton href="/faculty/export-excel" icon={FileDown} label="Export Reports" />
      </div>
    </div>
  );
}
