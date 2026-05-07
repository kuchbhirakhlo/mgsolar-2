'use client';

import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CareersSection() {
  const { t } = useLanguage();

  return (
    <section id="careers" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the renewable energy revolution. We are always looking for talented individuals to join our team.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/careers">Join Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
