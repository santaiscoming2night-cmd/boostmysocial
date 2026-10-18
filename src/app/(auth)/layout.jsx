import Script from 'next/script';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({ children }) {
  const settings = await getSettings();
  return (
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,500,500i,600,600i,700,700i&display=swap" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/plugins/jquery-toast/css/jquery.toast.css" />
      <link rel="stylesheet" href="/assets/plugins/boostrap/colors.css" />
      <link rel="stylesheet" href="/assets/css/util.css" />
      <link rel="stylesheet" href="/assets/css/layout.css" />

      <div className="login-bg-image" />
      <div className="page auth-login-form">
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-12">
              <div className="text-center mb-4">
                <Link href="/">
                  <img src={settings.website_logo || '/assets/images/logo.png'} alt={settings.website_title} style={{ maxHeight: 46 }} />
                </Link>
              </div>
              {children}
              <div className="text-center text-muted mt-4 small">
                <Link href="/">← {settings.website_title}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Script src="/assets/js/vendors/jquery-3.2.1.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/vendors/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/core.js" strategy="afterInteractive" />
    </>
  );
}
