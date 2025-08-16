// src/lib/fonts.ts
import { Poppins, Roboto_Mono } from 'next/font/google';

// Main body font (Poppins with multiple weights)
export const fontSans = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap', // Optional: improves loading behavior
});

// Heading variant (can use same Poppins with different weights)
export const fontHeading = Poppins({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['600', '700'], // Only bold weights for headings
});

// Monospace font for code
export const fontMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Optional: Export all fonts as array for easy usage in layout
export const fontVariables = [
  fontSans.variable,
  fontHeading.variable,
  fontMono.variable,
];