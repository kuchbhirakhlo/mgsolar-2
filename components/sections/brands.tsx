'use client';

import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          scrollContainer.scrollLeft += 1;

          // Reset scroll when reaching the end
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft = 0;
          }
        }
      }, 50);
    };

    const stopAutoScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };

    startAutoScroll();

    // Pause on hover
    scrollContainer.addEventListener('mouseenter', stopAutoScroll);
    scrollContainer.addEventListener('mouseleave', startAutoScroll);

    return () => {
      stopAutoScroll();
      scrollContainer.removeEventListener('mouseenter', stopAutoScroll);
      scrollContainer.removeEventListener('mouseleave', startAutoScroll);
    };
  }, []);

  return (
    <section id="brands" className="py-16 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">{t.brands.title}</h2>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Duplicate brands for seamless loop */}
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-white hover:bg-white/20 transition-all duration-300 flex-shrink-0 w-48"
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
              <p className="text-sm font-medium text-center mt-3 text-gray-800">{brand.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
