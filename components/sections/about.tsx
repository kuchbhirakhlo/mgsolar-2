'use client';

import { useLanguage } from '@/lib/language-context';
import { Check } from 'lucide-react';
import Image from 'next/image';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-24 h-24 text-primary">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Image
              src="/mgsolarlogo.jpg"
              alt="About MG Solar"
              width={200}
              height={100}
              className="rounded-2xl shadow-lg max-w-auto h-auto"
              suppressHydrationWarning
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-primary">{t.about.title}</h2>
            <p className="text-lg text-foreground/70 leading-relaxed">
              {t.about.description}
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Experience</h3>
                  <p className="text-foreground/70">Over 10 years of industry expertise</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Quality</h3>
                  <p className="text-foreground/70">Premium products and workmanship</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Support</h3>
                  <p className="text-foreground/70">24/7 customer support and maintenance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
