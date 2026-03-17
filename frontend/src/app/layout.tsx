// Root application layout with fonts, navigation, and shared providers.
import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';

import './globals.css';

const brandSerif = localFont({
  src: [
    {
      path: '../../public/fonts/playfair-display/playfair-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-400-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-500-italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-600-italic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-700-italic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-800.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-800-italic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-900.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display/playfair-900-italic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-serif',
  display: 'swap',
});

const brandSans = localFont({
  src: [
    {
      path: '../../public/fonts/outfit/outfit-300.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/outfit/outfit-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/outfit/outfit-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/outfit/outfit-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/outfit/outfit-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The CalmTable',
  description: 'Premium dining and reservation experience for The CalmTable.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${brandSans.variable} ${brandSerif.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('calmtable-theme');
                  var theme = stored === 'dark' ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-cream font-body text-ink antialiased">
        <Providers>
          <Navigation />
          <main className="pt-14">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
