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
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-primary">{t.about.title}</h2>
            <p className="text-lg text-foreground/70 leading-relaxed">
              MG Light Solar Pvt Ltd is a premier solar energy company based in Lucknow, Uttar Pradesh, specializing in comprehensive solar solutions for residential, commercial, and industrial clients. As a registered company under CIN: U35105UP2024PTC195857, we have established ourselves as trusted experts in solar panel installation, maintenance, and renewable energy systems.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Our team of certified professionals provides end-to-end solar services across Uttar Pradesh, including Lucknow, Gorakhpur, Ayodhya, Barabanki, Bahraich, Gonda, and Kushinagar. We offer complete solar photovoltaic power plants, solar energy equipment supply, and ongoing maintenance services to ensure optimal performance of your solar investments.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Certified & Registered</h3>
                  <p className="text-foreground/70">MCA registered company with CIN: U35105UP2024PTC195857</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Expert Team</h3>
                  <p className="text-foreground/70">Professional solar technicians with years of experience</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Complete Solutions</h3>
                  <p className="text-foreground/70">From consultation to installation and maintenance</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Regional Coverage</h3>
                  <p className="text-foreground/70">Serving multiple cities across Uttar Pradesh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Image
              src="/mgsolarlogo.png"
              alt="MG Light Solar Pvt Ltd"
              width={300}
              height={150}
              className="rounded-2xl shadow-lg max-w-auto h-auto"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>
    </section>
  );
}
