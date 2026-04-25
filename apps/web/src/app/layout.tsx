import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AnimeStream - Смотри аниме онлайн бесплатно',
  description: 'Смотрите любимое аниме онлайн в высоком качестве. Большая коллекция, регулярные обновления, удобная навигация и комментарии.',
  keywords: ['аниме', 'смотреть аниме', 'онлайн', 'бесплатно', 'HD качество', 'новинки аниме'],
  authors: [{ name: 'AnimeStream Team' }],
  creator: 'AnimeStream',
  publisher: 'AnimeStream',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    title: 'AnimeStream - Смотри аниме онлайн',
    description: 'Смотрите любимое аниме онлайн в высоком качестве',
    siteName: 'AnimeStream',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeStream',
    description: 'Смотри аниме онлайн бесплатно',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
