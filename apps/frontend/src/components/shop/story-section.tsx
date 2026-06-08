'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Blog } from '@/services/blog.service';
import { StoryViewer, type Story, type StorySlide } from './StoryViewer';


// ==========================================
// 2. Story Section Component
// ==========================================
interface StorySectionProps {
  blogs: Blog[];
}

export function StorySection({ blogs }: StorySectionProps) {
  const [selectedStoryIdx, setSelectedStoryIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  // Convert blogs to stories format
  const stories: Story[] = blogs
    .filter((blog) => blog.featuredImage)
    .map((blog) => ({
      id: blog.id,
      title: blog.title,
      thumbnail: blog.featuredImage!,
      slides: [
        {
          id: blog.id,
          type: 'image' as const,
          url: blog.featuredImage!,
          caption: blog.excerpt || blog.title,
          duration: 5000,
          blogSlug: blog.slug,
        },
      ],
    }));

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftButton(scrollLeft > 10);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    updateScrollButtons();
    scrollElement.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      scrollElement.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (stories.length === 0) return null;

  return (
    <section className="py-4 sm:py-6 bg-background border-b">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative">
          {/* Scroll buttons - Only show when needed */}
          {showRightButton && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-background hover:scale-110 transition-all"
              aria-label="اسکرول به راست"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {showLeftButton && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-background hover:scale-110 transition-all"
              aria-label="اسکرول به چپ"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Stories list */}
          <div 
            ref={scrollRef} 
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-6 sm:px-8 py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stories.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => setSelectedStoryIdx(idx)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-0.5 sm:p-1 bg-gradient-to-tr from-primary via-primary/70 to-primary/50 group-hover:scale-105 group-active:scale-95 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 sm:border-[3px] border-background">
                    <Image
                      src={story.thumbnail}
                      alt={story.title}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-center max-w-[64px] sm:max-w-[80px] md:max-w-[96px] truncate font-medium">
                  {story.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIdx !== null && (
        <StoryViewer 
          stories={stories} 
          initialStoryIndex={selectedStoryIdx} 
          onClose={() => setSelectedStoryIdx(null)} 
        />
      )}
    </section>
  );
}
