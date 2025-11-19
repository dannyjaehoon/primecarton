import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ZodError } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert prisma object into a regular js object
export function convertToPlainObject<T>(value: T) : T {
  return JSON.parse(JSON.stringify(value));
}

export function formatNumberWidthDecimal(num:number) :string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2,'0')}` : `${int}.00`;
}

// eslint-disabled-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if(error instanceof ZodError) {
      const firstMessage = error.issues[0]?.message ?? 'Validation error';
      return firstMessage;
  } else if(error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {

    // handle prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    return typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
  }
}

// Round number to 2 decimal places
export function round2(value : number | string) {
  if(typeof value === 'number') {
    return Math.round(((value + Number.EPSILON) * 100)/ 100);
  } else if (typeof value === 'string') {
    return Math.round(((Number(value) + Number.EPSILON) * 100)/ 100);
  } else {
    throw new Error("value is not a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-Us', {
  currency: 'USD',
  style:'currency',
  minimumFractionDigits: 2
})
// format currency using the formatter above
export function formatCurrency(amount : number | string | null) {
  if(typeof amount === 'number') {
    return CURRENCY_FORMATTER.format(amount);
  } else if(typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return 'NaN';
  }
}