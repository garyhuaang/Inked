import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { StoreProvider } from '@/lib/providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Inked — Tattoo Artist Directory',
  description:
    'Find tattoo artists across the DFW and Austin metros by style, shop, and neighbourhood.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
