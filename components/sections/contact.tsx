'use client';

import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
      setFormData({ name: '', lastName: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <section id="contact" className="py-20 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">{t.contact.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Google Map */}
          <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18815.80229599178!2d80.99207135937336!3d26.856445892252786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be32c8953726b%3A0x964537d9419ffe65!2sMG%20Solar%20Panel%20Installation%20Services%20(A%20Unit%20of%20MG%20Enterprise&#39;s)%20Lucknow!5e0!3m2!1sen!2sin!4v1775658954780!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-blue-200 border border-white/20 focus:outline-none focus:border-secondary"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-blue-200 border border-white/20 focus:outline-none focus:border-secondary"
                />
              </div>

              <input
                type="tel"
                name="phone"
                placeholder={t.contact.phone}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-blue-200 border border-white/20 focus:outline-none focus:border-secondary"
              />

              <textarea
                name="message"
                placeholder={t.contact.message}
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-blue-200 border border-white/20 focus:outline-none focus:border-secondary resize-none"
              ></textarea>

              <Button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium py-3"
              >
                {t.contact.send}
              </Button>

              {submitted && (
                <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg text-center">
                  Message sent successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
