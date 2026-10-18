import { requireUser } from '@/lib/auth';
import PageTitle from '@/components/PageTitle';
import CopyField from '@/components/CopyField';

export const metadata = { title: 'API documentation' };
export const dynamic = 'force-dynamic';

export default async function ApiDocsPage() {
  const user = await requireUser();
  const endpoint = (process.env.SITE_URL || 'https://your-domain.com').replace(/\/$/, '') + '/api/v1';

  const sections = [
    {
      name: 'services',
      description: 'List every active service with its ID, rate, minimum and maximum.',
      example: `curl -X POST ${endpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=services"`,
    },
    {
      name: 'add',
      description: 'Create an order. The charge is taken from your panel balance.',
      example: `curl -X POST ${endpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=add" \\
  -d "service=1" \\
  -d "link=https://instagram.com/p/xxxx" \\
  -d "quantity=1000"`,
    },
    {
      name: 'status',
      description: 'Check one order (order=<id>) or many (orders=1,2,3).',
      example: `curl -X POST ${endpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=status" \\
  -d "order=100"`,
    },
    {
      name: 'balance',
      description: 'Return the current balance of your panel account.',
      example: `curl -X POST ${endpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=balance"`,
    },
  ];

  return (
    <>
      <PageTitle icon="fe fe-share-2">API documentation</PageTitle>
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Your API key</h3></div>
            <div className="card-body">
              <CopyField value={user.api_key} />
              <p className="text-muted small mb-0 mt-2">Keep this key secret. All requests are POST and accept form fields or JSON.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Endpoint</h3></div>
            <div className="card-body"><CopyField value={endpoint} /></div>
          </div>
          {sections.map((section) => (
            <div className="card" key={section.name}>
              <div className="card-header"><h3 className="card-title">action={section.name}</h3></div>
              <div className="card-body">
                <p className="text-muted">{section.description}</p>
                <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>{section.example}</pre>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Response format</h3></div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded small mb-0">{`{
  "order": 100
}`}</pre>
              <hr />
              <p className="text-muted mb-0">
                Every error is returned as <code>{'{ "error": "message" }'}</code> with an HTTP 4xx status.
                Orders are charged exactly like orders placed in the panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
