import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartContext';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: {
    default: 'Aliado Food — Refeições, Pizzas e Bebidas em Luanda',
    template: '%s | Aliado Food',
  },
  description:
    'Encomenda refeições, pizzas e bebidas da Aliado Food. Entrega rápida por motorizada em Luanda com taxas por município. Levantamento no ponto de venda ou entrega ao domicílio.',
  keywords: ['Aliado Food', 'comida', 'Luanda', 'Angola', 'pizza', 'refeições', 'bebidas', 'entrega', 'delivery'],
  openGraph: {
    title: 'Aliado Food',
    description: 'Refeições, pizzas e bebidas com entrega rápida em Luanda.',
    type: 'website',
    locale: 'pt_AO',
  },
};

export const viewport: Viewport = {
  themeColor: '#C62E1F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
