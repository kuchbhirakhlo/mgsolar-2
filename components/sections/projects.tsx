'use client';

import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

const ResidentialIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-primary">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FactoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-primary">
    <path d="M2 20h20" />
    <path d="M5 20V8l7-5 7 5v12" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

const SchoolIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-primary">
    <path d="m4 6 8-4 8 4" />
    <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
    <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
    <path d="M18 5h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2" />
    <path d="M8 5H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2" />
  </svg>
);

interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  date: string;
  icon?: React.ReactElement;
  image: string;
}

const HotelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-primary">
    <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
    <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" />
    <path d="M8 7h.01" />
    <path d="M8 11h.01" />
    <path d="M16 7h.01" />
    <path d="M16 11h.01" />
    <path d="M12 7h.01" />
    <path d="M12 11h.01" />
  </svg>
);

// Function to assign icons based on project title
const getProjectIcon = (title: string): React.ReactElement => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('residential') || lowerTitle.includes('complex') || lowerTitle.includes('home')) {
    return <ResidentialIcon />;
  } else if (lowerTitle.includes('factory') || lowerTitle.includes('industrial') || lowerTitle.includes('commercial')) {
    return <FactoryIcon />;
  } else if (lowerTitle.includes('school') || lowerTitle.includes('campus') || lowerTitle.includes('education')) {
    return <SchoolIcon />;
  } else if (lowerTitle.includes('hotel') || lowerTitle.includes('hospital')) {
    return <HotelIcon />;
  } else {
    return <ResidentialIcon />; // Default icon
  }
};

const defaultRecentProjects: Project[] = [
  {
    id: '1',
    title: 'Residential Solar Installation - Lucknow',
    location: 'Lucknow, Uttar Pradesh',
    capacity: '5 kW',
    date: '2024',
    icon: <ResidentialIcon />,
    image: '/homesolar.png',
  },
  {
    id: '2',
    title: 'Commercial Building Project',
    location: 'Kanpur, Uttar Pradesh',
    capacity: '25 kW',
    date: '2024',
    icon: <FactoryIcon />,
    image: '/commercialsolarpanel.webp',
  },
  {
    id: '3',
    title: 'School Solar Power System',
    location: 'Ayodhya, Uttar Pradesh',
    capacity: '15 kW',
    date: '2023',
    icon: <SchoolIcon />,
    image: '/solarservices.jpeg',
  },
  {
    id: '4',
    title: 'Industrial Solar Installation',
    location: 'Gorakhpur, Uttar Pradesh',
    capacity: '50 kW',
    date: '2023',
    icon: <HotelIcon />,
    image: '/commercialsolarpanel.webp',
  },
];

export function ProjectsSection() {
  const { t } = useLanguage();
  const [recentProjects, setRecentProjects] = useState<Project[]>(defaultRecentProjects);

  useEffect(() => {
    // Load projects from Firebase
    const projectsRef = collection(db, 'projects');
    const unsubscribe = onSnapshot(projectsRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const firebaseProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Omit<Project, 'icon'>[];

      // Assign icons to Firebase projects
      const projectsWithIcons = firebaseProjects.map(project => ({
        ...project,
        icon: getProjectIcon(project.title)
      }));

      // Take first 4 projects, or merge with defaults if fewer than 4
      const combined = [...projectsWithIcons.slice(0, 4), ...defaultRecentProjects.slice(projectsWithIcons.length)];
      setRecentProjects(combined.slice(0, 4));
    });

    return () => unsubscribe();
  }, []);

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-primary">{t.projects.title}</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            {t.projects.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recentProjects.map((project: Project, index) => (
            <div
              key={project.id}
              className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 h-full">
                <div className="relative h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {project.image && project.image.startsWith('http') ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={300}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {project.icon}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {project.capacity}
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold">{project.date}</span>
                    </div>
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-lg"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/projects"
            className="inline-block px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium"
          >
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
