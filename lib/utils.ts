import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function isValidStatusTransition(from: string, to: string): boolean {
  const transitions: Record<string, string[]> = {
    DRAFT: ['PAID', 'CANCELLED'],
    PAID: ['SEARCHING', 'CANCELLED'],
    SEARCHING: ['OFFERED', 'CANCELLED'],
    OFFERED: ['ACCEPTED', 'SEARCHING', 'CANCELLED'],
    ACCEPTED: ['EN_ROUTE', 'CANCELLED'],
    EN_ROUTE: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['PIN_VERIFIED', 'CANCELLED'],
    PIN_VERIFIED: ['BEFORE_PHOTO', 'CANCELLED'],
    BEFORE_PHOTO: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['ADD_TIME_PENDING', 'COMPLETED', 'CANCELLED'],
    ADD_TIME_PENDING: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };
  return transitions[from]?.includes(to) ?? false;
}

export const PAYMENT_FILTER_KEYWORDS = [
  'cash', 'tip', 'venmo', 'zelle', 'cashapp', 'paypal',
  'pay you', 'pay directly', 'refund', 'discount',
  'price change', 'lower the price', 'chargeback'
];

export function filterPaymentMessage(message: string): { filtered: boolean; body: string } {
  const lowerMessage = message.toLowerCase();
  const hasKeyword = PAYMENT_FILTER_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  if (hasKeyword) {
    return {
      filtered: true,
      body: 'For safety, pricing and payments are handled only in the app. Please contact support.'
    };
  }
  
  return { filtered: false, body: message };
}
