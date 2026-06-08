'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '@/lib/hooks/queries/useProducts';
import { ProductSlider } from './ProductSlider';
import type { ProductListItem } from '@/services';

import {
  type SliderConfig,
  type ProductQueryInput,
  sliderConfigs,
} from './HomeSlidersConfigs';

type SliderState = {
  isLoading: boolean;
  hasError: boolean;
  items: ProductListItem[];
};


function shouldHideSlider(state: SliderState): boolean {
  return !state.isLoading && !state.hasError && state.items.length === 0;
}

function pickItems<T>(primaryItems?: T[], fallbackItems?: T[]): T[] {
  if (Array.isArray(primaryItems) && primaryItems.length > 0) {
    return primaryItems;
  }

  if (Array.isArray(fallbackItems) && fallbackItems.length > 0) {
    return fallbackItems;
  }

  return primaryItems ?? fallbackItems ?? [];
}



function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, [breakpoint]);

  return isMobile;
}



function useResponsiveSliderLimit() {
  const isMobile = useIsMobile();

  return useMemo(
    () => ({
      isMobile,
      listLimit: isMobile ? 6 : 12,
      heavyLimit: isMobile ? 10 : 24,
      searchLimit: isMobile ? 6 : 10,
    }),
    [isMobile]
  );
}

function useResolvedSliderProducts(config: SliderConfig) {
  const { heavyLimit, listLimit, searchLimit } = useResponsiveSliderLimit();

  const resolveLimit = (
    queryFactory?: ((limit: number) => ProductQueryInput) | undefined
  ): number => {
    if (!queryFactory) return listLimit;

    const query = queryFactory(listLimit);

    if (!query) return listLimit;

    if ('search' in query && query.search && !query.categorySlugs?.length) {
      return searchLimit;
    }

    if (config.filter) {
      return heavyLimit;
    }

    return listLimit;
  };

  const primaryLimit = resolveLimit(config.primaryQuery);
  const fallbackLimit = resolveLimit(config.fallbackQuery);

  const primaryQuery = useMemo(() => config.primaryQuery(primaryLimit), [config, primaryLimit]);

  const fallbackQuery = useMemo(
    () => (config.fallbackQuery ? config.fallbackQuery(fallbackLimit) : undefined),
    [config, fallbackLimit]
  );

  const primary = useProducts(primaryQuery);
  const fallback = useProducts(fallbackQuery);

  const items = useMemo(() => {
    const baseItems = pickItems(primary.data?.items, fallback.data?.items);
    const filteredItems = config.filter ? baseItems.filter(config.filter) : baseItems;

    return filteredItems.slice(0, config.slice ?? listLimit);
  }, [primary.data?.items, fallback.data?.items, config, listLimit]);

  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = config.fallbackQuery ? primary.isError && fallback.isError : primary.isError;

  return {
    items,
    isLoading,
    hasError,
  };
}

function CategorySliderSection({ config }: { config: SliderConfig }) {
  const { items, isLoading, hasError } = useResolvedSliderProducts(config);

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title={config.title}
      mobileTitle={config.mobileTitle}
      subtitle={config.subtitle}
      mobileSubtitle={config.mobileSubtitle}
      viewAllLink={config.viewAllLink}
      products={items}
      isLoading={isLoading}
      variant={config.variant}
      mobilePeek={1.5}
    />
  );
}




export function MobilePhonesSlider() {
  return <CategorySliderSection config={sliderConfigs.mobilePhones} />;
}

export function GamingLaptopSlider() {
  return <CategorySliderSection config={sliderConfigs.gamingLaptops} />;
}

export function BudgetLaptopSlider() {
  return <CategorySliderSection config={sliderConfigs.budgetLaptops} />;
}

export function WorkstationLaptopSlider() {
  return <CategorySliderSection config={sliderConfigs.workstationLaptops} />;
}

export function UltrabookSlider() {
  return <CategorySliderSection config={sliderConfigs.ultrabooks} />;
}

export function TabletSlider() {
  return <CategorySliderSection config={sliderConfigs.tablets} />;
}

export function ConsoleSlider() {
  return <CategorySliderSection config={sliderConfigs.consoles} />;
}

export function MonitorSlider() {
  return <CategorySliderSection config={sliderConfigs.monitors} />;
}

export function CaseSlider() {
  return <CategorySliderSection config={sliderConfigs.cases} />;
}

export function PrinterSlider() {
  return <CategorySliderSection config={sliderConfigs.printers} />;
}

export { sliderConfigs };
