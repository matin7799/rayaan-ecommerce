'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatPersianPrice } from '@/lib/utils/price';
import type { JSX } from 'react';

export interface CatalogTableListingMobileProps {
  groupedRows: {
    mainCategory: string;
    subgroups: {
      key: string;
      subcategory: string;
      rows: any[];
    }[];
  }[];
  isPartner: boolean;
  togglePriceSort: () => void;
  renderPriceSortIcon: () => JSX.Element;
  loadingQuickViewId: string | null;
  openQuickView: (productId: string) => Promise<void>;
}

export function CatalogTableListingMobile({
  groupedRows,
  isPartner,
  togglePriceSort,
  renderPriceSortIcon,
  loadingQuickViewId,
  openQuickView,
}: CatalogTableListingMobileProps) {
  return (
    <div className="space-y-4 md:hidden">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={togglePriceSort} className="gap-2">
          {renderPriceSortIcon()}
          <span>مرتب‌سازی قیمت</span>
        </Button>
      </div>

      <Accordion defaultValue={groupedRows.map((group) => group.mainCategory)} multiple>
        {groupedRows.map((group) => (
          <AccordionItem key={group.mainCategory} value={group.mainCategory} className="rounded-xl border bg-background px-2">
            <AccordionTrigger className="px-2 py-3 text-sm font-semibold no-underline hover:no-underline **:data-[slot=accordion-trigger-icon]:transition-transform **:data-[slot=accordion-trigger-icon]:duration-200">
              {group.mainCategory}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion defaultValue={group.subgroups.map((subgroup) => subgroup.key)} multiple className="pb-2">
                {group.subgroups.map((subgroup) => (
                  <AccordionItem key={`${subgroup.key}-mobile`} value={subgroup.key} className="mb-2 rounded-lg border bg-background px-2">
                    <AccordionTrigger className="px-1 py-2 text-xs text-muted-foreground no-underline hover:no-underline **:data-[slot=accordion-trigger-icon]:transition-transform **:data-[slot=accordion-trigger-icon]:duration-200">
                      {subgroup.subcategory}
                    </AccordionTrigger>
                    <AccordionContent>
                      {subgroup.rows.map((row) => (
                        <div key={row.id} className="mb-2 rounded-2xl border bg-background p-3">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="relative size-14 overflow-hidden rounded-lg bg-muted">
                              <Image src={row.imageUrl} alt={row.imageAlt} fill sizes="56px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-6 wrap-break-word">{row.title}</p>
                              <p className="text-xs text-muted-foreground">کد کالا: {row.sku}</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>قیمت: {formatPersianPrice(row.basePrice)} تومان</p>
                            {isPartner ? (
                              <p>
                                قیمت همکار:{' '}
                                {typeof row.collaboratorPrice === 'number'
                                  ? `${formatPersianPrice(row.collaboratorPrice)} تومان`
                                  : 'تماس بگیرید'}
                              </p>
                            ) : null}
                          </div>
                          <Button className="mt-3 w-full" variant="outline" onClick={() => openQuickView(row.id)}>
                            {loadingQuickViewId === row.id ? 'در حال بارگذاری...' : 'مشاهده'}
                          </Button>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
