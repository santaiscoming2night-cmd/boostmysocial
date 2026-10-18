'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function NavItem({ href, icon, label, active, badge, onNavigate }) {
  return (
    <Link href={href} className={`nova-nav-link ${active ? 'active' : ''}`} onClick={onNavigate}>
      <i className={icon} aria-hidden="true" />
      <span>{label}</span>
      {badge ? <span className="nova-nav-count">{badge}</span> : null}
    </Link>
  );
}

function NavGroup({ icon, label, active, items, path, onNavigate }) {
  const [open, setOpen] = useState(active);
  return (
    <div className="nova-nav-group">
      <button
        type="button"
        className={`nova-nav-trigger ${active ? 'active' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <i className={icon} aria-hidden="true" />
        <span>{label}</span>
        <i className="fe fe-chevron-down nova-nav-chevron" aria-hidden="true" />
      </button>
      <div className={`nova-subnav ${open ? 'open' : ''}`}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={path === item.href || path.startsWith(`${item.href}/`) ? 'active' : ''}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardShell({ user, settings, unreadTickets = 0, children }) {
  const path = usePathname() || '';
  const [menu, setMenu] = useState(false);
  const isAdmin = user.role === 'admin';
  const rawBalance = Number(user.balance || 0);
  const balance = Number.isFinite(rawBalance) ? rawBalance.toFixed(Number(settings.currency_decimal || 2)) : '0.00';
  const segment = (route) => path === route || path.startsWith(`${route}/`);
  const closeMenu = () => setMenu(false);
  const firstName = user.first_name || 'Operator';
  const initials = `${user.first_name?.[0] || 'O'}${user.last_name?.[0] || ''}`.toUpperCase();
  const accountLabel = isAdmin ? 'System operator' : `${settings.currency_symbol || '$'}${balance} available`;

  const orderItems = [
    { href: '/order/log', label: 'Order history' },
    { href: '/dripfeed', label: 'Drip-feed' },
    { href: '/subscriptions', label: 'Subscriptions' },
  ];
  const managerItems = [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/subscribers', label: 'Subscribers' },
    { href: '/admin/deposits', label: 'Add funds' },
  ];
  const systemItems = [
    { href: '/admin/settings', label: 'Settings' },
    { href: '/admin/providers', label: 'API providers' },
    { href: '/admin/deposits', label: 'Payments' },
    { href: '/admin/orders', label: 'All orders' },
    { href: '/admin/content', label: 'Content studio' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/tickets', label: 'Tickets' },
  ];

  return (
    <div className={`nova-dashboard ${menu ? 'mobile-open' : ''}`}>
      {menu ? <button className="nova-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} /> : null}
      <aside className={`nova-sidebar ${menu ? 'mobile-open' : ''}`} aria-label="Panel navigation">
        <div className="nova-sidebar-brand">
          <Link href="/dashboard" className="nova-brand" onClick={closeMenu} aria-label={`${settings.website_title || 'Boost My Social'} dashboard`}>
            <span className="nova-brand-mark" aria-hidden="true">✦</span>
            <span className="nova-brand-name">{settings.website_title || 'Boost My Social'}</span>
          </Link>
        </div>

        <p className="nova-sidebar-caption">Control room</p>
        <nav className="nova-dashboard-nav">
          <NavItem href="/dashboard" icon="fe fe-grid" label="Overview" active={segment('/dashboard')} onNavigate={closeMenu} />
          <NavItem href="/order/add" icon="fe fe-zap" label="Launch order" active={segment('/order/add')} onNavigate={closeMenu} />
          <NavGroup
            icon="fe fe-layers"
            label="Campaigns"
            active={segment('/order/log') || segment('/dripfeed') || segment('/subscriptions')}
            items={orderItems}
            path={path}
            onNavigate={closeMenu}
          />
          <NavItem href="/services" icon="fe fe-compass" label="Service catalog" active={segment('/services')} onNavigate={closeMenu} />
          {settings.enable_api_tab === '1' && !isAdmin ? <NavItem href="/api/docs" icon="fe fe-code" label="API studio" active={segment('/api/docs')} onNavigate={closeMenu} /> : null}
          <NavItem href="/tickets" icon="fe fe-message-circle" label="Support" badge={unreadTickets || null} active={segment('/tickets')} onNavigate={closeMenu} />
          {!isAdmin ? <NavItem href="/add-funds" icon="fe fe-credit-card" label="Add funds" active={segment('/add-funds')} onNavigate={closeMenu} /> : null}
          <NavItem href="/transactions" icon="fe fe-clock" label="Activity log" active={segment('/transactions')} onNavigate={closeMenu} />

          {isAdmin ? (
            <>
              <p className="nova-sidebar-caption" style={{ marginTop: 15 }}>Administration</p>
              <NavGroup
                icon="fe fe-users"
                label="People"
                active={segment('/admin/users') || segment('/admin/subscribers') || segment('/admin/deposits')}
                items={managerItems}
                path={path}
                onNavigate={closeMenu}
              />
              <NavGroup
                icon="fe fe-sliders"
                label="System studio"
                active={segment('/admin/settings') || segment('/admin/providers') || segment('/admin/orders') || segment('/admin/content') || segment('/admin/services') || segment('/admin/categories') || segment('/admin/tickets')}
                items={systemItems}
                path={path}
                onNavigate={closeMenu}
              />
            </>
          ) : null}
        </nav>

        <div className="nova-sidebar-bottom">
          {!isAdmin ? (
            <div className="nova-balance-clay">
              <span>Ready balance</span>
              <b>{settings.currency_symbol || '$'}{balance}</b>
              <Link href="/add-funds" onClick={closeMenu}><i className="fe fe-plus-circle" /> Add funds</Link>
            </div>
          ) : null}
          <div className="nova-side-user">
            <Link href="/profile" className="d-flex align-items-center min-width-0" onClick={closeMenu}>
              <span className="nova-avatar">{initials}</span>
              <span className="ml-2">
                <b>{firstName}</b>
                <span>{accountLabel}</span>
              </span>
            </Link>
            <Link href="/logout" className="nova-signout" title="Sign out" aria-label="Sign out"><i className="fe fe-log-out" /></Link>
          </div>
        </div>
      </aside>

      <main className="nova-dashboard-main">
        <header className="nova-dashboard-topbar">
          <div className="nova-topbar-status">
            <button className="nova-mobile-toggle" type="button" onClick={() => setMenu((value) => !value)} aria-label="Toggle navigation" aria-expanded={menu}>
              <i className={menu ? 'fe fe-x' : 'fe fe-menu'} />
            </button>
            <span><span className="nova-live-dot" />WORKSPACE</span>
            <b>Ready for your next move</b>
          </div>
          <div className="nova-topbar-right">
            <span className="nova-topbar-date">{isAdmin ? 'System control' : 'Growth control'}</span>
            <Link href="/profile" className="nova-topbar-profile">
              <span className="nova-avatar">{initials}</span>
              <span>{firstName}</span>
            </Link>
          </div>
        </header>

        <div className="nova-dashboard-content">
          <div className={path.startsWith('/services') || path.startsWith('/order/log') ? 'container container-wide' : 'container'}>
            {children}
          </div>
        </div>

        <footer className="nova-dashboard-footer">
          <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || '' }} />
          <nav className="nova-dashboard-footer-links" aria-label="Footer links">
            <Link href="/faq">FAQ</Link>
            <Link href="/page/terms">Terms</Link>
            <Link href="/tickets/new">Support</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
