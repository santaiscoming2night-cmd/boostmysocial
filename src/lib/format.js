import en from '@/lib/i18n/en.json';

/** Translate a key the same way the PHP `lang()` helper did. */
export function t(key) {
  if (!key) return '';
  const value = en[String(key).toLowerCase()];
  if (value) return value;
  const words = String(key).replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function decodeEntities(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function separators(settings) {
  const decimal =
    settings?.currency_decimal_separator === 'comma'
      ? ','
      : settings?.currency_decimal_separator === 'dot'
        ? '.'
        : '';
  const thousand =
    settings?.currency_thousand_separator === 'dot'
      ? '.'
      : settings?.currency_thousand_separator === 'space'
        ? ' '
        : settings?.currency_thousand_separator === 'comma'
          ? ','
          : '';
  return { decimal, thousand };
}

export function money(amount, settings, { symbol = true } = {}) {
  const value = Number(amount || 0);
  const decimals = Number(settings?.currency_decimal ?? 2);
  const { decimal, thousand } = separators(settings);
  const fixed = value.toFixed(Number.isFinite(decimals) ? decimals : 2);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousand || '');
  const out = frac !== undefined ? `${grouped}${decimal || '.'}${frac}` : grouped;
  return symbol ? `${settings?.currency_symbol ?? '$'}${out}` : out;
}

export function num(value, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

export function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dateOnly(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export const ORDER_STATUS = {
  active: { label: 'Active', className: 'status-active' },
  completed: { label: 'Completed', className: 'status-completed' },
  processing: { label: 'Processing', className: 'status-processing' },
  inprogress: { label: 'In progress', className: 'status-inprogress' },
  pending: { label: 'Pending', className: 'status-pending' },
  partial: { label: 'Partial', className: 'status-partial' },
  canceled: { label: 'Canceled', className: 'status-canceled' },
  refunded: { label: 'Refunded', className: 'status-refunded' },
  awaiting: { label: 'Awaiting', className: 'status-awaiting' },
  error: { label: 'Error', className: 'status-error' },
  fail: { label: 'Fail', className: 'status-fail' },
};

export function statusMeta(status) {
  return ORDER_STATUS[status] || { label: status || '—', className: 'status-default' };
}

export function orderStatusLabel(status) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'inprogress':
      return 'In progress';
    case 'partial':
      return 'Partial';
    case 'canceled':
      return 'Canceled';
    case 'refunded':
      return 'Refunded';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
  }
}

export function initials(first, last) {
  return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase() || 'U';
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
