'use client';

import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const ResidentialIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-primary">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CommercialIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-primary">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const MaintenanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-primary">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export function ServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <ResidentialIcon />,
      image: '/homesolar.png',
      title: 'Solar Panel Installation',
      description: 'Professional installation of high-quality solar panels for residential and commercial properties with expert technicians and guaranteed workmanship.',
      features: ['Site Assessment', 'Panel Mounting', 'Electrical Integration', 'System Testing'],
    },
    {
      icon: <CommercialIcon />,
      image: '/commercialsolarpanel.webp',
      title: 'Solar Energy Systems',
      description: 'Complete solar energy solutions including photovoltaic systems, inverters, batteries, and monitoring equipment for optimal energy generation.',
      features: ['System Design', 'Component Supply', 'Grid Connection', 'Performance Monitoring'],
    },
    {
      icon: <MaintenanceIcon />,
      image: '/solarservices.jpeg',
      title: 'Solar Panel Maintenance',
      description: 'Comprehensive maintenance and repair services to ensure your solar system operates at peak efficiency with regular inspections and prompt repairs.',
      features: ['System Inspection', 'Panel Cleaning', 'Component Repair', 'Performance Optimization'],
    },
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-primary">{t.services.title}</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center max-w-xs group cursor-pointer"
            >
              <div className="relative w-48 h-48 rounded-full border-4 border-primary/20 hover:border-primary hover:shadow-2xl transition-all duration-300 overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-primary">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm justify-center">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
