'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Loader2 } from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  createdAt: string;
}

export default function CareersPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
  });

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/careers');
        if (response.ok) {
          const data = await response.json();
          setPositions(data);
        }
      } catch (error) {
        console.error('Error fetching job positions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      alert('Application submitted successfully!');
      setFormData({ name: '', email: '', phone: '', position: '', experience: '', message: '' });
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-primary text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-lg text-blue-100">
              Build your career in sustainable solar energy
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Job Listings */}
              <div className="lg:col-span-2 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading job positions...</span>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No job positions available at the moment.</p>
                  </div>
                ) : (
                  positions.map((position) => (
                    <Card
                      key={position.id}
                      className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                      onClick={() => {
                        setExpandedId(expandedId === position.id ? null : position.id);
                        setSelectedPosition(position.id);
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-primary">{position.title}</CardTitle>
                            <CardDescription className="text-base mt-2">
                              {position.description}
                            </CardDescription>
                          </div>
                          <span className="text-2xl">
                            {expandedId === position.id ? '−' : '+'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4 text-sm">
                          <div className="flex items-center gap-2 text-foreground/70">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </div>
                          <div className="flex items-center gap-2 text-foreground/70">
                            <Briefcase className="w-4 h-4" />
                            {position.type}
                          </div>
                        </div>
                      </CardHeader>

                      {expandedId === position.id && (
                        <CardContent>
                          {position.requirements && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-2">Requirements:</h4>
                              <p className="text-sm text-muted-foreground">{position.requirements}</p>
                            </div>
                          )}
                          <Button
                            onClick={() => {
                              setFormData({ ...formData, position: position.title });
                              document.getElementById('application-form')?.scrollIntoView({
                                behavior: 'smooth',
                              });
                            }}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          >
                            Apply Now
                          </Button>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>

              {/* Application Form */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle id="application-form">Apply Now</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-accent"
                      />

                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-accent"
                      />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-accent"
                      />

                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-accent"
                      >
                        <option value="">Select Position</option>
                        {positions.map((pos) => (
                          <option key={pos.id} value={pos.title}>
                            {pos.title}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name="experience"
                        placeholder="Years of Experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-accent"
                      />

                      <textarea
                        name="message"
                        placeholder="Additional Message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-accent resize-none"
                      ></textarea>

                      <Button
                        type="submit"
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        Submit Application
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
