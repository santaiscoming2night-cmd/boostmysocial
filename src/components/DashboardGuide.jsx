'use client';

import Link from 'next/link';
import { useState } from 'react';

const MEMBER_STEPS = [
  {
    href: '/order/add',
    icon: 'fe fe-zap',
    tone: 'purple',
    title: 'Place an order',
    text: 'Choose a service and add your post link.',
  },
  {
    href: '/services',
    icon: 'fe fe-compass',
    tone: 'pink',
    title: 'Browse services',
    text: 'See what is available before you order.',
  },
  {
    href: '/tickets/new',
    icon: 'fe fe-message-circle',
    tone: 'blue',
    title: 'Get help',
    text: 'Send a message if you need support.',
  },
];

export default function DashboardGuide({ admin = false, counts = {} }) {
  const [open, setOpen] = useState(true);
  const steps = admin
    ? [
        {
          href: '/admin/orders',
          icon: 'fe fe-inbox',
          tone: 'pink',
          title: 'Check orders',
          text: `${counts.orders || 0} total · ${counts.pendingOrders || 0} need attention`,
        },
        {
          href: '/admin/tickets',
          icon: 'fe fe-message-circle',
          tone: 'blue',
          title: 'Answer messages',
          text: `${counts.openTickets || 0} support ticket${counts.openTickets === 1 ? '' : 's'} open`,
        },
        {
          href: '/admin/settings',
          icon: 'fe fe-sliders',
          tone: 'purple',
          title: 'Edit your site',
          text: 'Update your name, logo, links, and settings.',
        },
      ]
    : MEMBER_STEPS;

  return (
    <section className={`dashboard-guide ${admin ? 'dashboard-guide--admin' : ''}`} aria-labelledby="dashboard-guide-title">
      <div className="dashboard-guide-header">
        <div>
          <span className="dashboard-guide-kicker">{admin ? 'TODAY AT A GLANCE' : 'QUICK START'}</span>
          <h2 id="dashboard-guide-title">{admin ? 'Keep things moving' : 'Ready to grow?'}</h2>
          <p>{admin ? 'Start with the items that need your attention.' : 'Three easy ways to get started.'}</p>
        </div>
        <button
          type="button"
          className="dashboard-guide-toggle"
          aria-expanded={open}
          aria-controls="dashboard-guide-steps"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? 'Hide' : 'Show'}</span>
          <i className={`fe fe-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
        </button>
      </div>
      <div id="dashboard-guide-steps" className={`dashboard-guide-steps ${open ? 'is-open' : ''}`}>
        {steps.map((step, index) => (
          <Link href={step.href} className="dashboard-guide-step" key={step.href}>
            <span className={`dashboard-guide-icon dashboard-guide-icon--${step.tone}`}><i className={step.icon} aria-hidden="true" /></span>
            <span className="dashboard-guide-copy">
              <b><small>0{index + 1}</small>{step.title}</b>
              <span>{step.text}</span>
            </span>
            <i className="fe fe-arrow-up-right dashboard-guide-arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
