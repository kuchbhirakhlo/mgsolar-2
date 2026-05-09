import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/sections/hero';
import { ServicesSection } from '@/components/sections/services';
import { ProjectsSection } from '@/components/sections/projects';
import { BrandsSection } from '@/components/sections/brands';

import { AboutSection } from '@/components/sections/about';

import { ContactSection } from '@/components/sections/contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Solar Panel Dealer & Installation Services in Lucknow | MG Light Solar Uttar Pradesh',
  description: 'Looking for reliable solar panel installation in Lucknow, Gorakhpur, Ayodhya, Barabanki, Bahraich, Gonda & Kushinagar? Get affordable rooftop solar installation, maintenance, repair & after-sales services from MG Light Solar.',
  keywords: [
    'solar panels Lucknow',
    'solar installation Uttar Pradesh',
    'solar dealer Lucknow',
    'rooftop solar system',
    'MG Light Solar',
    'best solar panels UP',
    'solar installer Lucknow',
    'renewable energy Lucknow',
    'solar power installation',
    'solar panel vendor Uttar Pradesh',
    'grid-connected solar systems',
    'solar quotations Lucknow',
    'solar maintenance services',
    'green energy solutions UP',
    'solar panel price in Lucknow',
    'best solar company near me',
    'rooftop solar installation cost in Gorakhpur',
    'solar subsidy services in Uttar Pradesh',
    'home solar installation in Ayodhya',
    'commercial solar installation company in Barabanki',
    'solar repair near me',
    'solar maintenance company in Bahraich',
    'hybrid solar system dealer in Gonda',
    'solar battery replacement in Kushinagar'
  ],
  authors: [{ name: 'MG Light Solar PVT LTD' }],
  creator: 'MG Light Solar PVT LTD',
  publisher: 'MG Light Solar PVT LTD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mgsolar.co.in'), // Assuming domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MG Light Solar PVT LTD - Solar Panel Experts in Lucknow',
    description: 'Professional solar panel installation and dealer services in Lucknow, Uttar Pradesh. Quality solar solutions for your home and business.',
    url: 'https://mgsolar.co.in',
    siteName: 'MG Light Solar PVT LTD',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/homeheroimage.jpg',
        width: 1200,
        height: 630,
        alt: 'MG Light Solar Panel Installation Services in Lucknow and Uttar Pradesh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Solar Panel Dealer & Installation Services in Lucknow | MG Light Solar Uttar Pradesh',
    description: 'Looking for reliable solar panel installation in Lucknow, Gorakhpur, Ayodhya, Barabanki, Bahraich, Gonda & Kushinagar? Get affordable rooftop solar installation, maintenance, repair & after-sales services.',
    images: [{ url: '/homeheroimage.jpg', alt: 'MG Light Solar Panel Installation Services in Lucknow and Uttar Pradesh' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add actual code
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "MG Light Solar PVT LTD",
    "description": "Leading solar panel dealer and installer in Lucknow, Uttar Pradesh. Providing high-quality solar panels, installation services, maintenance, and renewable energy solutions.",
    "url": "https://mgsolar.co.in",
    "telephone": "+91 88404 71901",
    "email": "mgenterprises0037@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "MG Road, Kalyanpur",
      "addressLocality": "Lucknow",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "226022",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.8467, // Lucknow coordinates
      "longitude": 80.9462
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "51",
      "bestRating": "5",
      "worstRating": "1"
    },
    "openingHours": "Mo-Sa 09:00-18:00",
    "priceRange": "$$",
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 26.8467,
        "longitude": 80.9462
      },
      "geoRadius": 100000 // 100km radius
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Solar Panel Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar Panel Installation",
            "description": "Professional installation of rooftop solar panels"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar System Maintenance",
            "description": "Maintenance and repair services for solar systems"
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProjectsSection />
        <BrandsSection />
        <AboutSection />
        <ContactSection />
      </main>

      {/* Tags Section */}
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Solar Panels Lucknow',
              'Solar Installation UP',
              'Solar Dealer Lucknow',
              'Rooftop Solar System',
              'MG Light Solar',
              'Best Solar Panels Uttar Pradesh',
              'Solar Installer Lucknow',
              'Renewable Energy Lucknow',
              'Solar Power Installation',
              'Solar Panel Vendor UP',
              'Grid-Connected Solar Systems',
              'Solar Quotations Lucknow',
              'Solar Maintenance Services',
              'Green Energy Solutions Uttar Pradesh',
              'Solar Battery Lucknow',
              'Solar Inverter Dealer UP',
              'Residential Solar Panels',
              'Commercial Solar Installation',
              'Solar Subsidies Lucknow',
              'Net Metering Assistance UP'
            ].map((tag, index) => (
              <span
                key={index}
                className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
