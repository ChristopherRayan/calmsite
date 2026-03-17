// Root application layout with fonts, navigation, and shared providers.
import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';

import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';

import './globals.css';

const brandSerif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const brandSans = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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
