import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="container text-center" style={{ padding: '120px 0' }}>
      <h1 className="display-1">404</h1>
      <p className="text-muted">We couldn&apos;t find that page.</p>
      <Link href="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
