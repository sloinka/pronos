import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export const PLANS = {
  weekly: {
    priceId: process.env.STRIPE_WEEKLY_PRICE_ID!,
    name: "Weekly",
    price: 4.99,
    currency: "USD",
    interval: "week" as const,
  },
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    name: "Monthly",
    price: 12.99,
    currency: "USD",
    interval: "month" as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    name: "Yearly",
    price: 89.99,
    currency: "USD",
    interval: "year" as const,
    badge: "Best Value — Save 42%",
  },
};
