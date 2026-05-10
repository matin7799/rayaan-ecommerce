import { Injectable } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import {
  PriceCalculatorService,
  PricingContext,
  PricingChannel,
} from './price-calculator.service';
import { CampaignsService } from '../../campaign/campaigns.service';
import { PriceBreakdown } from '../interfaces/pricing.interface';

@Injectable()
export class ProductPricingService {
  constructor(
    private readonly priceCalculator: PriceCalculatorService,
    private readonly campaignsService: CampaignsService,
  ) {}

  async calculateProductPrice(
    product: Product,
    context: PricingContext = {},
  ): Promise<PriceBreakdown> {
    const pricing = this.priceCalculator.calculatePrice(product, context);

    /**
     * برای بعضی channelها شاید نخواهیم کمپین اعمال شود.
     * مثلاً برای partner ممکن است تخفیف همکار کافی باشد.
     */
    const shouldApplyCampaign =
      context.channel === PricingChannel.PUBLIC ||
      context.channel === PricingChannel.TOROB ||
      !context.channel;

    if (!shouldApplyCampaign) {
      return pricing;
    }

    const { discount, campaign } =
      await this.campaignsService.calculateDiscountForProduct(
        product.id,
        pricing.finalPrice,
      );

    if (!campaign || discount <= 0) {
      return pricing;
    }

    const finalPrice = Math.max(0, pricing.finalPrice - discount);
    const savings = pricing.basePrice - finalPrice;

    return {
      ...pricing,
      finalPrice,
      savings,
      savingsPercent:
        pricing.basePrice > 0
          ? Math.round((savings / pricing.basePrice) * 10000) / 100
          : 0,
      discounts: [
        ...pricing.discounts,
        {
          type: 'CAMPAIGN',
          amount: discount,
          percent:
            pricing.finalPrice > 0
              ? Math.round((discount / pricing.finalPrice) * 10000) / 100
              : 0,
          title: campaign.title,
          campaignId: campaign.id,
        },
      ],
    };
  }
}
