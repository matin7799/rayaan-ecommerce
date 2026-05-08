import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { blogService } from '@/services';
import { Calendar, Clock, Eye, User, ArrowRight, Tag } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await blogService.getBlogBySlug(slug);

    return {
      title: blog.metaTitle || `${blog.title} | بلاگ`,
      description: blog.metaDescription || blog.excerpt || blog.title,
      keywords: blog.metaKeywords?.join(', '),
    };
  } catch {
    return {
      title: 'مقاله یافت نشد',
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let blog;

  try {
    blog = await blogService.getBlogBySlug(slug);
    // Increment view count (fire and forget)
    blogService.incrementView(blog.id).catch(() => {});
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به بلاگ
      </Link>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>
            {blog.author.firstName} {blog.author.lastName}
          </span>
        </div>
        {blog.publishedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(blog.publishedAt).toLocaleDateString('fa-IR')}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{blog.readingTime} دقیقه مطالعه</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{blog.viewCount} بازدید</span>
        </div>
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {blog.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-muted rounded-full text-xs font-medium"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Excerpt */}
      {blog.excerpt && (
        <div className="bg-muted/50 border-r-4 border-primary p-4 rounded-lg mb-8">
          <p className="text-lg font-medium">{blog.excerpt}</p>
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Share buttons (placeholder) */}
      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-lg font-bold mb-4">اشتراک‌گذاری</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            تلگرام
          </button>
          <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            واتساپ
          </button>
          <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            کپی لینک
          </button>
        </div>
      </div>
    </div>
  );
}
