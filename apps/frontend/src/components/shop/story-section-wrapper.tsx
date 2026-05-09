import { blogService } from '@/services/blog.service';
import { StorySection } from './story-section';

export async function StorySectionWrapper() {
  let blogsResponse;

  try {
    blogsResponse = await blogService.getPublishedBlogs({ limit: 6 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Failed to load stories: ${message}`);
    return null;
  }

  if (!blogsResponse?.items || blogsResponse.items.length === 0) {
    return null;
  }

  return <StorySection blogs={blogsResponse.items} />;
}
