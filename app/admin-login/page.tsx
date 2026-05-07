'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { getAuth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scriptLoaded && window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => setToken(token),
        'error-callback': () => setError('Security check failed.'),
        'expired-callback': () => setToken(null),
      });
    }
  }, [scriptLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!token) {
      setError('Please complete the security check.');
      setLoading(false);
      return;
    }

    try {
      const auth = await getAuth();
      // First, authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Then check if this authenticated user exists in adminUsers collection
      const q = query(collection(db, 'adminUsers'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('You are not authorized as an admin user.');
        // Sign out the user since they're not in admin collection
        await auth.signOut();
        setLoading(false);
        return;
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      if (!adminData.active) {
        setError('Your admin account has been deactivated. Contact support.');
        // Sign out the user
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Store admin auth data in session storage
      const sessionData = {
        id: adminDoc.id,
        firebaseUid: user.uid,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions || [],
        active: adminData.active
      };

      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('adminData', JSON.stringify(sessionData));

      // Navigate to admin dashboard
      router.push('/mgadmin');
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle Firebase Auth errors
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Invalid password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else if (err.name !== 'AbortError') {
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
              src="/mgsolarlogo.png"
              alt="MG Solar Logo"
              width={48}
              height={48}
              className=""
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
          <p className="text-sm text-muted-foreground">MG Solar Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
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

          <div ref={turnstileRef}></div>

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

        {/* Login Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Admin access only. Contact the system administrator if you need assistance.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:underline">
            Back to Website
          </a>
        </div>
      </div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={() => setScriptLoaded(true)}
      />
    </div>
  );
}