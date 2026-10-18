import Script from 'next/script';
import './globals.css';
import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.website_title || 'Boost My Social',
    description: settings.website_desc || settings.website_tagline || '',
    keywords: settings.website_keywords || '',
    icons: { icon: settings.website_favicon || '/assets/images/favicon.png' },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const themeBootScript = `
  (function () {
    try {
      var saved = localStorage.getItem('boostmysocial-theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <body>
        <Script id="theme-boot" strategy="beforeInteractive">{themeBootScript}</Script>
        {children}
      </body>
    </html>
  );
}
