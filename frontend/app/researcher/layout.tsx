'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Database,
  Code,
  Brain,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/researcher', icon: BarChart3 },
  { name: 'Data', href: '/researcher/data', icon: Database },
  { name: 'API', href: '/researcher/api', icon: Code },
  { name: 'Models', href: '/researcher/models', icon: Brain },
  { name: 'Insights', href: '/researcher/insights', icon: TrendingUp },
];

export default function ResearcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/researcher') return pathname === '/researcher';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
              <span className="font-semibold text-slate-900">Researchers</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Back to Home */}
          <div className="p-3 border-t border-slate-200">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="lg:hidden ml-2 font-semibold text-slate-900">Researchers</span>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
