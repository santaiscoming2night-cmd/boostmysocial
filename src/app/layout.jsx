import './globals.css';
import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.website_title || 'Boost My Social',
    description: settings.website_desc || '',
    keywords: settings.website_keywords || '',
    icons: { icon: settings.website_favicon || '/assets/images/favicon.png' },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
