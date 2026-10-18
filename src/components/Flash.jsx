export default function Flash({ ok, err, info }) {
  if (!ok && !err && !info) return null;
  const variant = err ? 'danger' : ok ? 'success' : 'info';
  const message = err || ok || info;
  return (
    <div className={`alert alert-${variant}`} role="alert">
      {message}
    </div>
  );
}
