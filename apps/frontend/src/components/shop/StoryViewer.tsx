'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export type StorySlide = {
  id: string;
  type: 'image';
  url: string;
  caption?: string;
  duration: number;
  blogSlug: string;
};

export type Story = {
  id: string;
  title: string;
  thumbnail: string;
  slides: StorySlide[];
};

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

export function StoryViewer({
  stories,
  initialStoryIndex,
  onClose,
}: StoryViewerProps) {
  const [currentStoryIdx, setCurrentStoryIdx] = useState(initialStoryIndex);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentStory = stories[currentStoryIdx];
  const currentSlide = currentStory?.slides[currentSlideIdx];
  const totalSlides = currentStory?.slides.length || 0;

  const nextSlide = useCallback(() => {
    if (currentSlideIdx < totalSlides - 1) {
      setCurrentSlideIdx((prev) => prev + 1);
      setProgress(0);
    } else if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx((prev) => prev + 1);
      setCurrentSlideIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentSlideIdx, totalSlides, currentStoryIdx, stories.length, onClose]);

  const prevSlide = useCallback(() => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx((prev) => prev - 1);
      setProgress(0);
    } else if (currentStoryIdx > 0) {
      setCurrentStoryIdx((prev) => prev - 1);
      setCurrentSlideIdx(0);
      setProgress(0);
    }
  }, [currentSlideIdx, currentStoryIdx]);

  // Auto-advance slides
  useEffect(() => {
    if (!currentSlide || isPaused) return;

    const duration = currentSlide.duration;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        nextSlide();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  // Touch navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setTouchStart(null);
  };

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!currentStory || !currentSlide) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 sm:p-3 z-10">
        {currentStory.slides.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 sm:h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: idx === currentSlideIdx ? `${progress}%` : idx < currentSlideIdx ? '100%' : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-3 sm:top-5 left-0 right-0 flex items-center justify-between px-3 sm:px-4 z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
            <Image 
              src={currentStory.thumbnail} 
              alt={currentStory.title} 
              width={40} 
              height={40} 
              className="object-cover w-full h-full" 
            />
          </div>
          <span className="text-white font-medium text-sm sm:text-base truncate">
            {currentStory.title}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-white p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label={isPaused ? 'ادامه' : 'توقف'}
          >
            {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button 
            onClick={onClose} 
            className="text-white p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-24 sm:pt-20 sm:pb-28">
        <div className="relative w-full h-full max-w-lg mx-auto">
          <Image 
            src={currentSlide.url} 
            alt={currentSlide.caption || ''} 
            fill 
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 512px"
          />
          {currentSlide.caption && (
            <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 px-4 sm:px-6">
              <p className="text-white text-center text-sm sm:text-base md:text-lg font-medium drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                {currentSlide.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation areas - Hidden on mobile, visible on desktop */}
      <button 
        onClick={prevSlide} 
        className="hidden sm:block absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer group"
        aria-label="قبلی"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </button>
      <button 
        onClick={nextSlide} 
        className="hidden sm:block absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer group"
        aria-label="بعدی"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </button>

      {/* Read More Button */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center z-10 px-4">
        <Link
          href={`/blog/${currentSlide.blogSlug}`}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-black rounded-full font-medium text-sm sm:text-base hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          onClick={onClose}
        >
          مطالعه مقاله
        </Link>
      </div>

      {/* Mobile navigation indicators */}
      <div className="sm:hidden absolute bottom-20 left-0 right-0 flex justify-center gap-8 text-white/60 text-xs">
        <span>← سوایپ برای بعدی</span>
        <span>سوایپ برای قبلی →</span>
      </div>
    </div>
  );
}
