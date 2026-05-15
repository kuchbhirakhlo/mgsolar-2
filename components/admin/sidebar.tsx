'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, MessageSquare, LogOut, Users, UserPlus, Wrench, X, CreditCard, Truck, FileText, Briefcase, Receipt } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { getAuth } from '@/lib/firebase';
import Image from 'next/image';

const adminNavItems = [
  { href: '/mgadmin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mgadmin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/mgadmin/careers', label: 'Careers', icon: Briefcase },
  { href: '/mgadmin/messages', label: 'Messages', icon: MessageSquare },
];

const employeeNavItems: typeof adminNavItems = [];

const installerNavItems: typeof adminNavItems = [];

interface AdminSidebarProps {
  isEmployee?: boolean;
  isInstaller?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function AdminSidebar({ isEmployee = false, isInstaller = false, onClose, collapsed = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  let navItems = adminNavItems;
  if (isInstaller) {
    navItems = installerNavItems;
  } else if (isEmployee) {
    navItems = employeeNavItems;
  }

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth if admin
      if (!isEmployee && !isInstaller) {
        const auth = await getAuth();
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }

    // Clear session storage
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('employeeLoggedIn');
    sessionStorage.removeItem('employeeData');
    sessionStorage.removeItem('adminData');

    // Redirect to appropriate login page
    if (isInstaller) {
      router.push('/installer-login');
    } else if (isEmployee) {
      router.push('/employee-login');
    } else {
      router.push('/admin-login');
    }
  };

  return (
    <aside className={`bg-primary text-white shadow-lg h-full flex flex-col overflow-hidden transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`flex items-center justify-between ${collapsed ? 'px-3 py-4' : 'p-6'} flex-shrink-0`}>
        <Link href="/" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <div >
          </div>
          {!collapsed && <Image src="/mgsolarlogo.png" alt="MG Solar Logo" width={120} height={30} className="object-contain brightness-0 invert" />}
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-blue-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-4'} space-y-1`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 ${collapsed ? '' : 'flex-shrink-0'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`flex-shrink-0 ${collapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-lg text-blue-100 hover:bg-blue-800 transition w-full`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className={`w-5 h-5 ${collapsed ? '' : 'flex-shrink-0'}`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
