'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  date: string;
  image: string;
  description?: string;
}

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects from Firebase
    const projectsRef = collection(db, 'projects');
    const unsubscribe = onSnapshot(projectsRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setAllProjects(projectsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-primary text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
            <p className="text-lg text-blue-100">
              Explore our successful solar installations across the country
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProjects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-lg hover:border-accent transition-all duration-300 group"
                >
                   <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all overflow-hidden">
                     {project.image.startsWith('http') ? (
                       <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-6xl">{project.image}</span>
                     )}
                   </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-primary">{project.title}</h3>
                    <p className="text-foreground/80">{project.description}</p>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Location</span>
                        <span className="font-medium text-primary">{project.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Capacity</span>
                        <span className="font-medium text-accent">{project.capacity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Year</span>
                        <span className="font-medium">{project.date}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
