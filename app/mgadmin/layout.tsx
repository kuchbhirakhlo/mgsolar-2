'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getAuth } from '@/lib/firebase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isInstaller, setIsInstaller] = useState(false);
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage to persist collapsed state
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        const employeeData = sessionStorage.getItem('employeeData');

        if (employeeData) {
          const employee = JSON.parse(employeeData);
          if (employee.isBlocked) {
            sessionStorage.removeItem('employeeData');
            sessionStorage.removeItem('employeeLoggedIn');
            if (employee.role === 'installer' || employee.isInstaller) {
              router.push('/installer-login');
            } else {
              router.push('/employee-login');
            }
            return;
          }
          setUserName(employee.name);
          if (employee.role === 'installer' || employee.isInstaller) {
            setIsInstaller(true);
            setIsEmployee(false);
          } else {
            setIsEmployee(true);
            setIsInstaller(false);
          }
        } else if (adminLoggedIn) {
          // For admin users, also check Firebase Auth state
          const auth = await getAuth();
          const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (!user) {
              // Firebase user not authenticated, clear session and redirect
              sessionStorage.removeItem('adminLoggedIn');
              sessionStorage.removeItem('adminData');
              router.push('/admin-login');
              return;
            }
          });

          // Clean up the listener
          return () => unsubscribe();

          setIsEmployee(false);
          setIsInstaller(false);
        } else {
          router.push('/admin-login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin-login');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-muted flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="bg-primary text-white px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex-shrink-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white hover:bg-blue-800 p-2"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Sidebar Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newState = !sidebarCollapsed;
                setSidebarCollapsed(newState);
                localStorage.setItem('sidebarCollapsed', newState.toString());
              }}
              className="hidden md:flex text-white hover:bg-blue-800 p-2"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <h1 className="text-lg sm:text-xl font-bold truncate">MG Admin</h1>
          </div>

          {/* User Info / Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-sm text-blue-100">
              {isInstaller || isEmployee ? `Hello, ${userName}` : 'Admin'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <AdminSidebar
            isEmployee={isEmployee}
            isInstaller={isInstaller}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className={`absolute left-0 top-0 h-full w-64 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <AdminSidebar
              isEmployee={isEmployee}
              isInstaller={isInstaller}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-white overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
