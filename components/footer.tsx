'use client';

import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-white border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto  px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div>
            <p className="text-blue-100 text-sm mb-4">
              MG Solar is a leading provider of MG Solar , helping homes and businesses transition to clean, renewable energy. We specialize in residential and commercial solar installations, maintenance, and support services.
            </p>
            <p className="text-blue-100 text-sm">
              <strong>Address:</strong> Chetna Towers, D-62, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010<br />
              <strong>Phone:</strong> +916307868355
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link href="#home" className="hover:text-secondary transition">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-secondary transition">
                  {t.about.title}
                </Link>
              </li>
              <li>
                <Link href="#careers" className="hover:text-secondary transition">
                  {t.nav.careers}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link href="#services" className="hover:text-secondary transition">
                  {t.services.title}
                </Link>
              </li>
              <li>
              <Link href="#projects" className="hover:text-secondary transition">
                {t.projects.title}
              </Link>
              </li>
              <li>
                <Link href="#brands" className="hover:text-secondary transition">
                  {t.nav.brands}
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-secondary transition">
                  {t.contact.title}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <a href="https://www.facebook.com/mgsolarcompany/" className="hover:text-secondary transition">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition">
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Office</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link href="/admin-login" className="hover:text-secondary transition">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/employee-login" className="hover:text-secondary transition">
                  Partner Login
                </Link>
              </li>
              <li>
                <Link href="/installer-login" className="hover:text-secondary transition">
                  Engineer Login
                </Link>
              </li>
            </ul>
          </div>         
        </div>
        <div className="border-t border-white/10 pt-8 flex justify-between text-sm text-blue-100">
          <p>
            © 2024 MG Solar. All rights reserved.
          </p>
          <p>
            Powered By <a href="http://procotech.in" className="hover:text-secondary transition">Proco Technologies</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
