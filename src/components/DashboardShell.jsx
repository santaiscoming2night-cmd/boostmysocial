'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function Item({ href, icon, label, active, badge }) {
  return (
    <li className="nav-item">
      <Link href={href} className={`nav-link ${active ? 'active' : ''}`}>
        <i className={icon} /> {label}
        {badge ? <span className="badge badge-info ml-1">{badge}</span> : null}
      </Link>
    </li>
  );
}

function Dropdown({ icon, label, active, children }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={`nav-item dropdown ${open ? 'show' : ''}`}>
      <button type="button" className={`nav-link ${active ? 'active' : ''} btn btn-link p-0`} onClick={() => setOpen(!open)}>
        <i className={icon} /> {label}
      </button>
      <div className={`dropdown-menu dropdown-menu-arrow ${open ? 'show' : ''}`} onClick={() => setOpen(false)}>
        {children}
      </div>
    </li>
  );
}

export default function DashboardShell({ user, settings, unreadTickets = 0, children }) {
  const path = usePathname() || '';
  const [menu, setMenu] = useState(false);
  const isAdmin = user.role === 'admin';
  const balance = Number(user.balance || 0).toFixed(Number(settings.currency_decimal || 2));
  const segment = (p) => path === p || path.startsWith(p + '/');

  return (
    <>
      <div className="header top py-4">
        <div className="container">
          <div className="d-flex">
            <Link href="/dashboard">
              <img src={settings.website_logo_white || '/assets/images/logo-white.png'} alt="Website logo" style={{ maxHeight: 40 }} />
            </Link>
            <div className="d-flex order-lg-2 ml-auto my-auto">
              <div className="dropdown show">
                <Link href="/profile" className="nav-link pr-0 leading-none">
                  <span className="avatar" style={{ backgroundImage: 'url(/assets/images/user-avatar.png)' }} />
                  <span className="ml-2 d-none d-lg-block">
                    <span className="text-default text-white">Hi, <span className="text-uppercase">{user.first_name || 'User'}</span>!</span>
                    <small className="text-muted text-white d-block mt-1">
                      {isAdmin ? 'Admin account' : `Balance: ${settings.currency_symbol}${balance}`}
                    </small>
                  </span>
                </Link>
              </div>
              <Link href="/logout" className="nav-link text-white ml-3" title="Sign out"><i className="fe fe-log-out" /></Link>
              <button type="button" className="header-toggler text-white d-lg-none ml-3 my-auto" onClick={() => setMenu(!menu)}>
                <span className="header-toggler-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`header collapse d-lg-flex p-0 ${menu ? 'show' : ''}`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg order-lg-first">
              <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                <Item href="/dashboard" icon="fe fe-bar-chart-2" label="Statistics" active={segment('/dashboard')} />
                <Item href="/order/add" icon="fe fe-shopping-cart" label="New order" active={segment('/order/add')} />
                <Dropdown icon="fe fe-inbox" label="Order" active={segment('/order/log') || segment('/dripfeed') || segment('/subscriptions')}>
                  <Link href="/order/log" className="dropdown-item">Order logs</Link>
                  <Link href="/dripfeed" className="dropdown-item">Dripfeed</Link>
                  <Link href="/subscriptions" className="dropdown-item">Subscriptions</Link>
                </Dropdown>
                <Item href="/services" icon="fe fe-list" label="Services" active={segment('/services')} />
                {settings.enable_api_tab === '1' && !isAdmin ? (
                  <Item href="/api/docs" icon="fe fe-share-2" label="API" active={segment('/api/docs')} />
                ) : null}
                <Item href="/tickets" icon="fa fa-comments-o" label="Support" badge={unreadTickets || null} active={segment('/tickets')} />
                {!isAdmin ? <Item href="/add-funds" icon="fa fa-money" label="Add funds" active={segment('/add-funds')} /> : null}
                <Item href="/transactions" icon="fe fe-calendar" label="Transaction logs" active={segment('/transactions')} />
                {isAdmin ? (
                  <>
                    <Dropdown icon="fe fe-users" label="User manager" active={segment('/admin/users') || segment('/admin/subscribers')}>
                      <Link href="/admin/users" className="dropdown-item">Users</Link>
                      <Link href="/admin/subscribers" className="dropdown-item">Subscribers</Link>
                      <div className="dropdown-divider" />
                      <Link href="/admin/deposits" className="dropdown-item">Add funds</Link>
                    </Dropdown>
                    <Dropdown icon="fe fe-settings" label="System settings" active={segment('/admin/settings') || segment('/admin/services') || segment('/admin/categories') || segment('/admin/content') || segment('/admin/providers') || segment('/admin/tickets') || segment('/admin/orders')}>
                      <Link href="/admin/settings" className="dropdown-item">Settings</Link>
                      <Link href="/admin/providers" className="dropdown-item">API providers</Link>
                      <Link href="/admin/deposits" className="dropdown-item">Payments</Link>
                      <Link href="/admin/orders" className="dropdown-item">All orders</Link>
                      <div className="dropdown-divider" />
                      <Link href="/admin/content" className="dropdown-item">News / FAQs / Pages</Link>
                      <Link href="/admin/services" className="dropdown-item">Services</Link>
                      <Link href="/admin/categories" className="dropdown-item">Categories</Link>
                      <Link href="/admin/tickets" className="dropdown-item">Tickets</Link>
                    </Dropdown>
                  </>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="page-main">
          <div className="my-3 my-md-5">
            <div className={`container ${path.startsWith('/services') || path.startsWith('/order/log') ? 'container-wide' : ''}`}>
              {children}
            </div>
          </div>
        </div>
        <footer className="footer">
          <div className="container">
            <div className="row align-items-center flex-row-reverse">
              <div className="col-auto ml-lg-auto">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item"><Link href="/faq">FAQs</Link></li>
                  <li className="list-inline-item"><Link href="/page/terms">Terms</Link></li>
                </ul>
              </div>
              <div className="col-12 col-lg-auto mt-3 mt-lg-0 text-center">
                <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || '' }} />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
