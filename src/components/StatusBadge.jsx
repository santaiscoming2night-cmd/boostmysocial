import { orderStatusLabel } from '@/lib/format';

const MAP = {
  active: 'info',
  completed: 'success',
  processing: 'warning',
  inprogress: 'warning',
  pending: 'secondary',
  partial: 'warning',
  canceled: 'danger',
  refunded: 'dark',
  awaiting: 'secondary',
  error: 'danger',
  fail: 'danger',
};

export default function StatusBadge({ status }) {
  const variant = MAP[status] || 'secondary';
  return <span className={`badge badge-${variant}`}>{orderStatusLabel(status)}</span>;
}
