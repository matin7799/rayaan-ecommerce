export const DIGIPAY_INSTALLMENT_PLANS = [
  {
    id: 'bnpl',
    name: 'خرید اعتباری BNPL (الان بخر، بعدا پرداخت کن)',
    installments: 4,
    interestRate: 0,
    downpaymentRate: 0,
    description: 'بدون نیاز به ضامن و چک، بازپرداخت در ۴ قسط ماهانه بدون بهره',
  },
  {
    id: 'credit_12',
    name: 'تسهیلات اقساطی ۱۲ ماهه دیجی‌پی',
    installments: 12,
    interestRate: 21,
    downpaymentRate: 0,
    description: 'خرید اقساطی بلندمدت ۱۲ ماهه با نرخ بهره سالانه مصوب بانکی',
  },
  {
    id: 'credit_18',
    name: 'تسهیلات اقساطی ۱۸ ماهه دیجی‌پی',
    installments: 18,
    interestRate: 30,
    downpaymentRate: 0,
    description: 'خرید اقساطی بلندمدت ۱۸ ماهه با حداقل قسط ماهانه',
  },
];

export const DIGIPAY_LIMITS_CONFIG = {
  minAmountTomans: 100_000,
  maxAmountTomans: 50_000_000,
};
