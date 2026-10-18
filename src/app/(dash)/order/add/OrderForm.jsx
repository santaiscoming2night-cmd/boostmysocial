'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitOrder } from '@/app/actions/dashboard';

export default function OrderForm({ categories, services, prices, symbol, minimumDeposit, initialServiceId = '' }) {
  const router = useRouter();
  const preset = services.find((s) => String(s.id) === String(initialServiceId));
  const [categoryId, setCategoryId] = useState(preset ? String(preset.category_id) : '');
  const [serviceId, setServiceId] = useState(preset ? String(preset.id) : '');
  const [quantity, setQuantity] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const categoryServices = services.filter((s) => String(s.category_id) === String(categoryId));
  const service = services.find((s) => String(s.id) === String(serviceId));
  const price = service ? Number(prices[service.id] ?? service.price) : 0;
  const charge = service && quantity ? (price * Number(quantity)) / 1000 : 0;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess(null);

    if (!service) return setError('Choose a service first.');
    if (!link.trim()) return setError('Enter the link for your order.');
    const qty = Number(quantity);
    if (!qty || qty < service.min || qty > service.max) {
      return setError(`Quantity must be between ${service.min} and ${service.max}.`);
    }

    setBusy(true);
    const formData = new FormData();
    formData.set('service_id', String(service.id));
    formData.set('link', link.trim());
    formData.set('quantity', String(qty));
    formData.set('note', note.trim());
    let result;
    try {
      result = await submitOrder(formData);
    } catch {
      setError('Unable to place order. Please try again.');
      return;
    } finally {
      setBusy(false);
    }
    const { data, error: rpcError } = result;

    if (rpcError) {
      if (rpcError.message.includes('insufficient_funds')) {
        setError('Not enough funds on balance. Please add funds first.');
      } else if (rpcError.message.includes('quantity_below_min')) {
        setError(`Quantity must be at least ${service.min}.`);
      } else if (rpcError.message.includes('quantity_above_max')) {
        setError(`Maximum quantity for this service is ${service.max}.`);
      } else {
        setError(rpcError.message);
      }
      return;
    }

    setSuccess({ id: data.order_id, charge: data.charge, balance: data.balance });
    setLink('');
    setQuantity('');
    setNote('');
    router.refresh();
  }

  return (
    <>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? (
        <div className="alert alert-success">
          Order <strong>#{success.id}</strong> placed. Charged {symbol}{Number(success.charge).toFixed(2)}, new balance {symbol}{Number(success.balance).toFixed(2)}.{' '}
          <a href="/order/log" className="alert-link">View order logs</a>
        </div>
      ) : null}

      <form className="form" onSubmit={submit}>
        <div className="row">
          <div className="col-md-6">
            <div className="content-header-title"><h4><i className="fa fa-shopping-cart mr-2" />New order</h4></div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setServiceId(''); }} required>
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Order service</label>
              <select className="form-control" value={serviceId} onChange={(e) => setServiceId(e.target.value)} required disabled={!categoryId}>
                <option value="">Choose a service</option>
                {categoryServices.map((item) => (
                  <option key={item.id} value={item.id}>#{item.id} — {item.name}</option>
                ))}
              </select>
            </div>

            {service ? (
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Minimum</label>
                    <input className="form-control" readOnly value={service.min} />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Maximum</label>
                    <input className="form-control" readOnly value={service.max} />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Price / 1000</label>
                    <input className="form-control" readOnly value={`${symbol}${price.toFixed(2)}`} />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="form-group">
              <label>Link</label>
              <input className="form-control" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input className="form-control" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Note <span className="text-muted">(optional)</span></label>
              <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
              {busy ? 'Placing order…' : `Place order${charge ? ` — ${symbol}${charge.toFixed(2)}` : ''}`}
            </button>
          </div>

          <div className="col-md-6">
            {service ? (
              <div className="card bg-light">
                <div className="card-body">
                  <h4 className="card-title">Service details</h4>
                  <p className="text-muted mb-2">#{service.id}</p>
                  <p><strong>{service.name}</strong></p>
                  <div className="text-muted" style={{ whiteSpace: 'pre-wrap', maxHeight: 320, overflow: 'auto' }}>{service.description}</div>
                </div>
              </div>
            ) : (
              <div className="card bg-light">
                <div className="card-body text-muted">
                  Choose a category and service to see its minimum, maximum, price and description.
                  {minimumDeposit ? <div className="mt-3 small">Orders are charged from your balance. You can add funds from the Add funds page.</div> : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
