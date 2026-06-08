import { useMemo } from 'react';

export interface InstallmentPlan {
  id: string;
  name: string;
  installmentsCount: number;
  interestPercentage: number;
  monthlyPayment: number;
  prepayment: number;
  description: string;
}

export function useDigipayInstallment(priceTomans: number) {
  const plans = useMemo<InstallmentPlan[]>(() => {
    if (!priceTomans || priceTomans <= 0) return [];

    // Plan 1: BNPL (Buy Now Pay Later)
    // 4 installments, 0% interest, 0% downpayment
    const monthlyBNPL = Math.round(priceTomans / 4);

    // Plan 2: 12-Month credit
    // 12 installments, ~21% interest, 0% downpayment
    const totalWithInterest12 = priceTomans * 1.21;
    const monthly12 = Math.round(totalWithInterest12 / 12);

    // Plan 3: 18-Month credit
    // 18 installments, ~30% interest, 0% downpayment
    const totalWithInterest18 = priceTomans * 1.30;
    const monthly18 = Math.round(totalWithInterest18 / 18);

    return [
      {
        id: 'bnpl',
        name: 'خرید اعتباری BNPL دیجی‌پی',
        installmentsCount: 4,
        interestPercentage: 0,
        monthlyPayment: monthlyBNPL,
        prepayment: 0,
        description: 'بازپرداخت در ۴ قسط بدون سود و کارمزد با اعتبار دیجی‌پی',
      },
      {
        id: 'credit_12',
        name: 'اقساط ۱۲ ماهه دیجی‌پی',
        installmentsCount: 12,
        interestPercentage: 21,
        monthlyPayment: monthly12,
        prepayment: 0,
        description: 'تسهیلات اعتباری بلندمدت ۱۲ ماهه دیجی‌پی بدون ضامن',
      },
      {
        id: 'credit_18',
        name: 'اقساط ۱۸ ماهه دیجی‌پی',
        installmentsCount: 18,
        interestPercentage: 30,
        monthlyPayment: monthly18,
        prepayment: 0,
        description: 'خرید اقساطی بلندمدت ۱۸ ماهه با حداقل قسط ماهانه',
      },
    ];
  }, [priceTomans]);

  const bestStartingPlan = useMemo(() => {
    if (plans.length === 0) return null;
    // The lowest monthly payment is usually the 18-month plan
    const credit18 = plans.find((p) => p.id === 'credit_18');
    return credit18 || plans[plans.length - 1];
  }, [plans]);

  const formattedStartingPayment = useMemo(() => {
    if (!bestStartingPlan) return '';
    return bestStartingPlan.monthlyPayment.toLocaleString('fa-IR');
  }, [bestStartingPlan]);

  return {
    plans,
    bestStartingPlan,
    formattedStartingPayment,
    hasPlans: plans.length > 0,
  };
}
