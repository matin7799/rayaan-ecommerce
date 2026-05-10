// apps/backend/src/domains/blogs/blogs.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { TagsService } from '../catalog/services/tags.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly tagsService: TagsService,
  ) {}

  async create(createBlogDto: CreateBlogDto, authorId: string): Promise<Blog> {
    const existing = await this.blogRepository.findOne({
      where: { slug: createBlogDto.slug },
    });

    if (existing) {
      throw new ConflictException('Blog with this slug already exists');
    }

    const blog = this.blogRepository.create({
      title: createBlogDto.title,
      slug: createBlogDto.slug,
      excerpt: createBlogDto.excerpt || null,
      content: createBlogDto.content,
      featuredImage: createBlogDto.featuredImage || null,
      status: createBlogDto.status || BlogStatus.DRAFT,
      authorId,
      readingTime: createBlogDto.readingTime || 0,
      metaTitle: createBlogDto.metaTitle || null,
      metaDescription: createBlogDto.metaDescription || null,
      metaKeywords: createBlogDto.metaKeywords || null,
      publishedAt:
        createBlogDto.status === BlogStatus.PUBLISHED ? new Date() : null,
    });

    if (createBlogDto.tags && createBlogDto.tags.length > 0) {
      blog.tags = await this.tagsService.findOrCreateMany(createBlogDto.tags);
    }

    return await this.blogRepository.save(blog);
  }

  async findAll(params?: {
    status?: BlogStatus;
    authorId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Blog[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author')
      .leftJoinAndSelect('blog.tags', 'tags')
      .orderBy('blog.createdAt', 'DESC');

    if (params?.status) {
      query.andWhere('blog.status = :status', { status: params.status });
    }

    if (params?.authorId) {
      query.andWhere('blog.authorId = :authorId', {
        authorId: params.authorId,
      });
    }

    const [items, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { items, total };
  }

  async findPublished(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ items: Blog[]; total: number }> {
    return this.findAll({ ...params, status: BlogStatus.PUBLISHED });
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author', 'tags'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { slug },
      relations: ['author', 'tags'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findOne(id);

    if (updateBlogDto.slug && updateBlogDto.slug !== blog.slug) {
      const existing = await this.blogRepository.findOne({
        where: { slug: updateBlogDto.slug },
      });

      if (existing) {
        throw new ConflictException('Blog with this slug already exists');
      }
    }

    Object.assign(blog, updateBlogDto);

    if (updateBlogDto.status === BlogStatus.PUBLISHED && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    if (updateBlogDto.tags) {
      blog.tags = await this.tagsService.findOrCreateMany(updateBlogDto.tags);
    }

    return await this.blogRepository.save(blog);
  }

  async remove(id: string): Promise<void> {
    const blog = await this.findOne(id);
    await this.blogRepository.remove(blog);
  }

  async incrementView(id: string): Promise<void> {
    await this.blogRepository.increment({ id }, 'viewCount', 1);
  }

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}
