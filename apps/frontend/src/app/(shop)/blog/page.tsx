import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { blogService } from '@/services';
import { Calendar, Clock, Eye, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'بلاگ | فروشگاه',
  description: 'مقالات و اخبار فروشگاه',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  let blogs: Awaited<ReturnType<typeof blogService.getPublishedBlogs>>['items'] =
    [];
  let meta: Awaited<ReturnType<typeof blogService.getPublishedBlogs>>['meta'] = {
    total: 0,
    page,
    limit: 12,
    totalPages: 0,
  };

  try {
    const response = await blogService.getPublishedBlogs({
      page,
      limit: 12,
    });
    blogs = response.items;
    meta = response.meta;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Failed to load blog listing: ${message}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">بلاگ</h1>
        <p className="text-muted-foreground">مقالات و اخبار فروشگاه</p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-border/50">
          <h2 className="text-xl font-bold mb-2">مقاله‌ای یافت نشد</h2>
          <p className="text-muted-foreground">به زودی مقالات جدید منتشر می‌شود</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all"
              >
                {blog.featuredImage && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={blog.featuredImage}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{blog.author.firstName} {blog.author.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readingTime} دقیقه</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{blog.viewCount}</span>
                    </div>
                  </div>
                  {blog.publishedAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(blog.publishedAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`/blog?page=${pageNum}`}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pageNum === page
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary'
                  }`}
                >
                  {pageNum}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
