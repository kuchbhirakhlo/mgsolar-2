'use client';

import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
}

export function ReviewsSection() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    setLoading(false);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-[#4285F4]">{t.reviews.title}</h2>
          <p className="text-xl text-gray-600">{t.reviews.subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4]"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reviews available yet.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <Card key={`${review.id}-${idx}`} className="border border-gray-200 hover:shadow-lg transition-all bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-[#4285F4]">{review.author_name}</h3>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-[#FBBC05] text-[#FBBC05]' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Quote className="w-8 h-8 text-[#4285F4]/30 mb-2" />
                    <p className="text-gray-700 leading-relaxed line-clamp-4">{review.text}</p>
                    {review.relative_time_description && (
                      <p className="text-sm text-gray-500 mt-4">{review.relative_time_description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Write Review Button */}
            <div className="text-center mt-10">
              <a
                href="https://www.google.com/maps/place/MG+Solar+Panel+Installation+Services+(A+Unit+of+MG+Enterprise's)+Lucknow/@26.8625959,80.9926691,16.35z/data=!4m6!3m5!1s0x399be32c8953726b:0x964537d9419ffe65!8m2!3d26.862596!4d80.9978407!16s%2Fg%2F11yqcd8ylw?entry=ttu&g_ep=EgoyMDI0MDQwNS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition font-medium"
              >
                <Star className="w-5 h-5" />
                Write a Review
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
