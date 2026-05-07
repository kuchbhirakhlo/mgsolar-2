'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { getEmployeeByEmpId, getEmployeeByMobile } from '@/lib/firebase-service';
import { PWAInstall } from '@/app/components/pwa-install';

export default function EmployeeLogin() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let employeeData;

      // If loginId is a 10-digit number, treat as mobile, else employee ID
      if (/^\d{10}$/.test(loginId)) {
        employeeData = await getEmployeeByMobile(loginId);
      } else {
        employeeData = await getEmployeeByEmpId(loginId);
      }

      if (!employeeData) {
        setError('Invalid Employee ID');
        setLoading(false);
        return;
      }

      // Check password
      if (employeeData.password !== password) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      if (employeeData.isBlocked) {
        setError('Your account has been blocked. Contact admin.');
        setLoading(false);
        return;
      }

      // Store auth data in session storage
      const sessionData = {
        empId: employeeData.empId,
        name: employeeData.name,
        role: employeeData.role,
        isBlocked: employeeData.isBlocked,
        id: employeeData.id
      };

      sessionStorage.setItem('employeeLoggedIn', 'true');
      sessionStorage.setItem('employeeData', JSON.stringify(sessionData));

      // Navigate to employee dashboard
      router.push('/mgadmin/customers');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.name !== 'AbortError') {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mb-4">
            <Image
              src="/mgsolarlogo.jpg"
              alt="MG Solar Logo"
              width={48}
              height={48}
              className=""
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">MG Partner</h1>
          <p className="text-sm text-muted-foreground">MG Solar Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee ID or Mobile Number</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter employee ID or mobile number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <div className="mt-4 flex justify-center">
          <PWAInstall />
        </div>

        {/* Login Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Use your Employee ID or mobile number and password provided by the admin to log in. Contact admin if you need assistance.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:underline">
            Back to Website
          </a>
        </div>
      </div>
    </div>
  );
}