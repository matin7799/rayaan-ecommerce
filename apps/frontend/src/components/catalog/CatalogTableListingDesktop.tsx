'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatPersianPrice } from '@/lib/utils/price';
import type { JSX } from 'react';

export interface CatalogTableListingDesktopProps {
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

export function CatalogTableListingDesktop({
  groupedRows,
  isPartner,
  togglePriceSort,
  renderPriceSortIcon,
  loadingQuickViewId,
  openQuickView,
}: CatalogTableListingDesktopProps) {
  return (
    <div className="hidden rounded-2xl border bg-background p-2 md:block">
      <Accordion defaultValue={groupedRows.map((group) => group.mainCategory)} multiple>
        {groupedRows.map((group) => (
          <AccordionItem key={group.mainCategory} value={group.mainCategory} className="mb-2 rounded-xl border px-2">
            <AccordionTrigger className="px-2 py-3 text-sm font-semibold no-underline hover:no-underline **:data-[slot=accordion-trigger-icon]:transition-transform **:data-[slot=accordion-trigger-icon]:duration-200">
              {group.mainCategory}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion defaultValue={group.subgroups.map((subgroup) => subgroup.key)} multiple className="px-1 pb-2">
                {group.subgroups.map((subgroup) => (
                  <AccordionItem key={subgroup.key} value={subgroup.key} className="mb-2 rounded-lg border px-2">
                    <AccordionTrigger className="px-2 py-2 text-xs text-muted-foreground no-underline hover:no-underline **:data-[slot=accordion-trigger-icon]:transition-transform **:data-[slot=accordion-trigger-icon]:duration-200">
                      {subgroup.subcategory}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table dir="rtl">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">تصویر</TableHead>
                            <TableHead className="text-right">SKU</TableHead>
                            <TableHead className="text-right">نام</TableHead>
                            <TableHead className="text-right">
                              <button
                                type="button"
                                onClick={togglePriceSort}
                                className="inline-flex items-center gap-1 font-inherit"
                              >
                                <span>قیمت</span>
                                {renderPriceSortIcon()}
                              </button>
                            </TableHead>
                            {isPartner ? <TableHead className="text-right">قیمت همکار</TableHead> : null}
                            <TableHead className="text-right">مشاهده</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subgroup.rows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>
                                <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                                  <Image src={row.imageUrl} alt={row.imageAlt} fill sizes="48px" className="object-cover" />
                                </div>
                              </TableCell>
                              <TableCell>{row.sku}</TableCell>
                              <TableCell className="max-w-[280px] whitespace-normal wrap-break-word font-medium leading-6">
                                {row.title}
                              </TableCell>
                              <TableCell>{formatPersianPrice(row.finalPrice ?? row.basePrice)} تومان</TableCell>
                              {isPartner ? (
                                <TableCell>
                                  {typeof row.collaboratorPrice === 'number'
                                    ? `${formatPersianPrice(row.collaboratorPrice)} تومان`
                                    : 'تماس بگیرید'}
                                </TableCell>
                              ) : null}
                              <TableCell>
                                <Button size="sm" variant="outline" onClick={() => openQuickView(row.id)}>
                                  {loadingQuickViewId === row.id ? 'در حال بارگذاری...' : 'مشاهده'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
