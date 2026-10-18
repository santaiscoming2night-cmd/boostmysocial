'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';

function NavItem({ href, icon, label, active, badge, onNavigate }) {
  return (
    <Link href={href} className={`atelier-nav-link ${active ? 'active' : ''}`} onClick={onNavigate}>
      <i className={icon} aria-hidden="true" />
      <span>{label}</span>
      {badge ? <span className="atelier-nav-count">{badge}</span> : null}
    </Link>
  );
}

function NavGroup({ icon, label, active, items, path, onNavigate }) {
  const [open, setOpen] = useState(active);
  return (
    <div className="atelier-nav-group">
      <button
        type="button"
        className={`atelier-nav-trigger ${active ? 'active' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <i className={icon} aria-hidden="true" />
        <span>{label}</span>
        <i className="fe fe-chevron-down atelier-nav-chevron" aria-hidden="true" />
      </button>
      <div className={`atelier-subnav ${open ? 'open' : ''}`}>
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
  const accountLabel = isAdmin ? 'Administrator' : `${settings.currency_symbol || '$'}${balance} available`;

  const orderItems = [
    { href: '/order/log', label: 'Order history' },
    { href: '/dripfeed', label: 'Scheduled orders' },
    { href: '/subscriptions', label: 'Subscriptions' },
  ];
  const moreAdminItems = [
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/providers', label: 'API connections' },
    { href: '/admin/content', label: 'Website content' },
    { href: '/admin/subscribers', label: 'Email list' },
  ];

  return (
    <div className={`atelier-dashboard ${menu ? 'mobile-open' : ''}`}>
      {menu ? <button className="atelier-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} /> : null}
      <aside className={`atelier-sidebar ${menu ? 'mobile-open' : ''}`} aria-label="Panel navigation">
        <div className="atelier-sidebar-brand">
          <Brand settings={settings} href="/dashboard" onNavigate={closeMenu} showTagline />
        </div>

        <p className="atelier-sidebar-caption">MAIN MENU</p>
        <nav className="atelier-dashboard-nav">
          <NavItem href="/dashboard" icon="fe fe-grid" label="Dashboard" active={segment('/dashboard')} onNavigate={closeMenu} />
          <NavItem href="/order/add" icon="fe fe-zap" label="Place order" active={segment('/order/add')} onNavigate={closeMenu} />
          <NavGroup
            icon="fe fe-layers"
            label="My orders"
            active={segment('/order/log') || segment('/dripfeed') || segment('/subscriptions')}
            items={orderItems}
            path={path}
            onNavigate={closeMenu}
          />
          <NavItem href="/services" icon="fe fe-compass" label="Services" active={segment('/services')} onNavigate={closeMenu} />
          {settings.enable_api_tab === '1' && !isAdmin ? <NavItem href="/api/docs" icon="fe fe-code" label="API" active={segment('/api/docs')} onNavigate={closeMenu} /> : null}
          {!isAdmin ? <NavItem href="/tickets" icon="fe fe-message-circle" label="Support" badge={unreadTickets || null} active={segment('/tickets')} onNavigate={closeMenu} /> : null}
          {!isAdmin ? <NavItem href="/add-funds" icon="fe fe-credit-card" label="Add funds" active={segment('/add-funds')} onNavigate={closeMenu} /> : null}
          {!isAdmin ? <NavItem href="/transactions" icon="fe fe-clock" label="Transactions" active={segment('/transactions')} onNavigate={closeMenu} /> : null}

          {isAdmin ? (
            <>
              <p className="atelier-sidebar-caption" style={{ marginTop: 15 }}>ADMIN</p>
              <NavItem href="/admin/orders" icon="fe fe-inbox" label="Orders" active={segment('/admin/orders')} onNavigate={closeMenu} />
              <NavItem href="/admin/users" icon="fe fe-users" label="Users" active={segment('/admin/users')} onNavigate={closeMenu} />
              <NavItem href="/admin/tickets" icon="fe fe-message-circle" label="Support" badge={unreadTickets || null} active={segment('/admin/tickets')} onNavigate={closeMenu} />
              <NavItem href="/admin/deposits" icon="fe fe-credit-card" label="Payments" active={segment('/admin/deposits')} onNavigate={closeMenu} />
              <NavItem href="/admin/settings" icon="fe fe-sliders" label="Site settings" active={segment('/admin/settings')} onNavigate={closeMenu} />
              <NavGroup
                icon="fe fe-more-horizontal"
                label="More"
                active={segment('/admin/providers') || segment('/admin/content') || segment('/admin/services') || segment('/admin/categories') || segment('/admin/subscribers')}
                items={moreAdminItems}
                path={path}
                onNavigate={closeMenu}
              />
            </>
          ) : null}
        </nav>

        <div className="atelier-sidebar-bottom">
          {!isAdmin ? (
            <div className="atelier-balance-clay">
              <span>Your balance</span>
              <b>{settings.currency_symbol || '$'}{balance}</b>
              <Link href="/add-funds" onClick={closeMenu}><i className="fe fe-plus-circle" /> Add funds</Link>
            </div>
          ) : null}
          <div className="atelier-side-user">
            <Link href="/profile" className="d-flex align-items-center min-width-0" onClick={closeMenu}>
              <span className="atelier-avatar">{initials}</span>
              <span className="ml-2">
                <b>{firstName}</b>
                <span>{accountLabel}</span>
              </span>
            </Link>
            <Link href="/logout" className="atelier-signout" title="Sign out" aria-label="Sign out"><i className="fe fe-log-out" /></Link>
          </div>
        </div>
      </aside>

      <main className="atelier-dashboard-main">
        <header className="atelier-dashboard-topbar">
          <div className="atelier-topbar-status">
            <button className="atelier-mobile-toggle" type="button" onClick={() => setMenu((value) => !value)} aria-label="Toggle navigation" aria-expanded={menu}>
              <i className={menu ? 'fe fe-x' : 'fe fe-menu'} />
            </button>
            <span><span className="atelier-live-dot" />{isAdmin ? 'ADMIN' : 'DASHBOARD'}</span>
            <b>{isAdmin ? 'Everything is ready' : 'Your account is ready'}</b>
          </div>
          <div className="atelier-topbar-right">
            <span className="atelier-topbar-date">{isAdmin ? 'Admin mode' : 'My account'}</span>
            <ThemeToggle compact />
            <Link href="/profile" className="atelier-topbar-profile">
              <span className="atelier-avatar">{initials}</span>
              <span>{firstName}</span>
            </Link>
          </div>
        </header>

        <div className="atelier-dashboard-content">
          <div className={path.startsWith('/services') || path.startsWith('/order/log') ? 'container container-wide' : 'container'}>
            {children}
          </div>
        </div>

        <footer className="atelier-dashboard-footer">
          <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || '' }} />
          <nav className="atelier-dashboard-footer-links" aria-label="Footer links">
            <Link href="/faq">FAQ</Link>
            <Link href="/page/terms">Terms</Link>
            <Link href="/tickets/new">Support</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
