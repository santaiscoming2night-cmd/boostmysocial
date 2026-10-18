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
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/css/nova-panel.css" />
      <DashboardShell user={user} settings={settings} unreadTickets={unread}>
        {children}
      </DashboardShell>
    </>
  );
}
