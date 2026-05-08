// apps/frontend/src/types/category.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}
