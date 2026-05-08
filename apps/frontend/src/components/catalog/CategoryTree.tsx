// src/components/catalog/CategoryTree.tsx
'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

interface CategoryTreeProps {
  categories: CategoryTreeItem[];
  selectedCategorySlugs: string[];
  expandedSlugs: Set<string>;
  onToggleCategory: (slug: string) => void;
  onToggleExpand: (slug: string) => void;
  parentId?: string | null;
  level?: number;
}

export function CategoryTree({
  categories,
  selectedCategorySlugs,
  expandedSlugs,
  onToggleCategory,
  onToggleExpand,
  parentId = null,
  level = 0,
}: CategoryTreeProps) {
  const childCategories = categories.filter((cat) => (cat.parentId ?? null) === parentId);

  if (!childCategories.length) return null;

  return (
    <div className="space-y-1.5">
      {childCategories.map((category) => {
        const isSelected = selectedCategorySlugs.includes(category.slug);
        const hasChildren = categories.some((cat) => (cat.parentId ?? null) === category.id);
        const isExpanded = expandedSlugs.has(category.slug);

        return (
          <div key={category.slug}>
            <div
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                isSelected
                  ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50',
              )}
              style={{ paddingInlineStart: `${level * 16 + 12}px` }}
            >
              <div className="flex min-w-0 items-center gap-2">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(category.slug);
                    }}
                    className="shrink-0 rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                ) : (
                  <span className="inline-block w-6 shrink-0" />
                )}

                <button
                  type="button"
                  onClick={() => {
                    onToggleCategory(category.slug);
                  }}
                  className="truncate text-right"
                >
                  {category.name}
                </button>
              </div>

              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleCategory(category.slug)}
              />
            </div>

            {hasChildren && isExpanded ? (
              <CategoryTree
                categories={categories}
                selectedCategorySlugs={selectedCategorySlugs}
                expandedSlugs={expandedSlugs}
                onToggleCategory={onToggleCategory}
                onToggleExpand={onToggleExpand}
                parentId={category.id}
                level={level + 1}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
