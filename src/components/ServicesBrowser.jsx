'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function ServicesBrowser({ categories, services, symbol = '$', signedIn = true }) {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((service) => {
      if (category && String(service.category_id) !== String(category)) return false;
      if (onlyActive && service.status !== 1) return false;
      if (!term) return true;
      return service.name.toLowerCase().includes(term) || String(service.id) === term;
    });
  }, [services, category, search, onlyActive]);

  const grouped = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, { category: c, rows: [] }));
    filtered.forEach((service) => {
      if (!map.has(service.category_id)) map.set(service.category_id, { category: { id: service.category_id, name: `Category #${service.category_id}` }, rows: [] });
      map.get(service.category_id).rows.push(service);
    });
    return [...map.values()].filter((group) => group.rows.length > 0);
  }, [categories, filtered]);

  return (
    <>
      <div className="card atelier-service-filter">
        <div className="card-body">
          <div className="row">
            <div className="col-md-5">
              <input className="form-control" placeholder="Search services by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-5">
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-center">
              <label className="custom-control custom-checkbox mb-0">
                <input type="checkbox" className="custom-control-input" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                <span className="custom-control-label">Active only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card atelier-service-empty"><div className="card-body text-center text-muted py-5">No boosts match your search.</div></div>
      ) : grouped.map(({ category: cat, rows }) => (
        <div className="card atelier-service-group" key={cat.id}>
          <div className="card-header"><span className="atelier-service-group-mark"><i className="fe fe-layers" /></span><h3 className="card-title">{cat.name}</h3><span className="atelier-service-count">{rows.length} services</span></div>
          <div className="table-responsive">
            <table className="table card-table table-vcenter table-sm">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Service</th>
                  <th>Rate / 1000</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((service) => (
                  <tr key={service.id}>
                    <td className="text-muted">{service.id}</td>
                    <td>
                      <div>{service.name}</div>
                      {service.description ? (
                        <details className="text-muted small">
                          <summary>Details</summary>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{service.description}</div>
                        </details>
                      ) : null}
                      {service.status !== 1 ? <span className="badge badge-secondary">inactive</span> : null}
                    </td>
                    <td>{symbol}{Number(service.custom_price != null ? service.custom_price : service.price).toFixed(2)}</td>
                    <td>{service.min}</td>
                    <td>{service.max}</td>
                    <td className="text-right">
                      <Link
                        href={signedIn ? `/order/add?service=${service.id}` : `/login?next=${encodeURIComponent(`/order/add?service=${service.id}`)}`}
                        className="btn btn-sm btn-primary"
                      >
                        {signedIn ? 'Boost it' : 'Sign in'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
