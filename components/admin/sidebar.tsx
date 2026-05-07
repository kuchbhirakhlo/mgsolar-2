'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, MessageSquare, LogOut, Users, UserPlus, Wrench, X, CreditCard, Truck, FileText, Briefcase, Receipt } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { getAuth } from '@/lib/firebase';

const adminNavItems = [
  { href: '/mgadmin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mgadmin/customers', label: 'Customers', icon: UserPlus },
  { href: '/mgadmin/quotations', label: 'Quotations', icon: FileText },
  { href: '/mgadmin/installations', label: 'Installations', icon: Wrench },
  { href: '/mgadmin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/mgadmin/payments', label: 'Payments', icon: CreditCard },
  { href: '/mgadmin/material-dispatch', label: 'Material Dispatch', icon: Truck },
  { href: '/mgadmin/careers', label: 'Careers', icon: Briefcase },
  { href: '/mgadmin/material-bill', label: 'Material Bills', icon: Receipt },
  { href: '/mgadmin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/mgadmin/employees', label: 'Employees', icon: Users },
];

const employeeNavItems = [
  { href: '/mgadmin/customers', label: 'Customers', icon: UserPlus },
  { href: '/mgadmin/quotations', label: 'Quotations', icon: FileText },
  { href: '/mgadmin/payments', label: 'Payments', icon: CreditCard },
];

const installerNavItems = [
  { href: '/mgadmin/installations', label: 'Engineers', icon: Wrench },
];

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
          <div className={`rounded-lg bg-secondary flex items-center justify-center ${
            collapsed ? 'w-8 h-8' : 'w-10 h-10'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-primary ${
              collapsed ? 'w-4 h-4' : 'w-6 h-6'
            }`}>
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          </div>
          {!collapsed && <span className="font-semibold text-sm">MG Solar</span>}
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
