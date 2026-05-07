'use client';

import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';

const brands = [
  { name: 'Tata', image: '/brandlogo/brand.tata.jpeg' },
  { name: 'Luminous', image: '/brandlogo/brand-luminous.webp' },
  { name: 'Exide', image: '/brandlogo/brand-exide.png' },
  { name: 'Amaron', image: '/brandlogo/brand-amaron.jpg' },
  { name: 'Adani', image: '/brandlogo/brand-adani.png' },
  { name: 'Utl', image: '/brandlogo/brand-utl.png' },
  { name: 'Vikram', image: '/brandlogo/brand-vikram.png' },
  { name: 'Waree', image: '/brandlogo/brand-waree.png' },
  { name: 'Loom', image: '/brandlogo/brand-loom.png' },
];

export function BrandsSection() {
  const { t } = useLanguage();

  return (
    <section id="brands" className="py-16 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">{t.brands.title}</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-white hover:bg-white/20 transition-all duration-300"
            >
              <div className="relative w-24 h-16">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  unoptimized
                  suppressHydrationWarning
                />
              </div>
              <p className="text-sm font-medium text-center mt-3">{brand.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
