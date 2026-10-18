import Script from 'next/script';
import DashboardShell from '@/components/DashboardShell';
import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);

  let unread = 0;
  try {
    const supabase = await createClient();
    if (supabase) {
      const { count } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['answered', 'new', 'pending']);
      unread = count || 0;
    }
  } catch {
    unread = 0;
  }

  return (
    <>
      <link rel="stylesheet" href="/assets/plugins/font-awesome/css/font-awesome.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,500,500i,600,600i,700,700i&display=swap" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/plugins/jquery-toast/css/jquery.toast.css" />
      <link rel="stylesheet" href="/assets/plugins/boostrap/colors.css" />
      <link rel="stylesheet" href="/assets/css/util.css" />
      <link rel="stylesheet" href="/assets/css/layout.css" />
      <link rel="stylesheet" href="/assets/css/footer.css" />

      <DashboardShell user={user} settings={settings} unreadTickets={unread}>
        {children}
      </DashboardShell>

      <Script src="/assets/js/vendors/jquery-3.2.1.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/vendors/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/core.js" strategy="afterInteractive" />
      <Script src="/assets/plugins/jquery-toast/js/jquery.toast.js" strategy="afterInteractive" />
    </>
  );
}
