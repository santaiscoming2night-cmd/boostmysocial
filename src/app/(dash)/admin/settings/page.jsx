import { getSettings } from '@/lib/settings';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import BrandSettingsFields from '@/components/BrandSettingsFields';
import { saveSettings } from '@/app/actions/admin';

export const metadata = { title: 'Panel settings' };
export const dynamic = 'force-dynamic';

const FIELDS = [
  { key: 'website_desc', label: 'Meta description', type: 'textarea' },
  { key: 'website_keywords', label: 'Meta keywords', type: 'textarea' },
  { key: 'website_favicon', label: 'Favicon URL' },
  { key: 'currency_code', label: 'Currency code (USD, GHS…)' },
  { key: 'currency_symbol', label: 'Currency symbol' },
  { key: 'currency_decimal', label: 'Decimal places' },
  { key: 'minimum_deposit', label: 'Minimum deposit' },
  { key: 'copy_right_content', label: 'Footer / copyright HTML', type: 'textarea' },
  { key: 'social_facebook_link', label: 'Facebook URL' },
  { key: 'social_twitter_link', label: 'Twitter / X URL' },
  { key: 'social_instagram_link', label: 'Instagram URL' },
  { key: 'social_youtube_link', label: 'YouTube URL' },
];

const TOGGLES = [
  { key: 'enable_api_tab', label: 'Show API tab' },
  { key: 'enable_service_list_no_login', label: 'Allow guests to browse services' },
  { key: 'disable_signup_page', label: 'Disable sign up' },
  { key: 'enable_news_announcement', label: 'Enable announcements' },
  { key: 'enable_explication_service_symbol', label: 'Show service symbol legend' },
];

export default async function AdminSettingsPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();

  return (
    <>
      <PageTitle icon="fe fe-sliders">Panel settings</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <form action={saveSettings} className="settings-studio-form">
        <BrandSettingsFields settings={settings} />

        <div className="card settings-studio-card">
          <div className="card-header">
            <div>
              <span className="settings-studio-label">Operations</span>
              <h2 className="card-title">Panel configuration</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              {FIELDS.map((field) => (
                <div className={field.type === 'textarea' ? 'col-12' : 'col-md-6'} key={field.key}>
                  <div className="form-group">
                    <label className="form-label" htmlFor={`field-${field.key}`}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea id={`field-${field.key}`} name={`s_${field.key}`} defaultValue={settings[field.key] || ''} className="form-control" rows={2} />
                    ) : (
                      <input id={`field-${field.key}`} name={`s_${field.key}`} defaultValue={settings[field.key] || ''} className="form-control" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card settings-studio-card">
          <div className="card-header">
            <div>
              <span className="settings-studio-label">Controls</span>
              <h2 className="card-title">Workspace access</h2>
            </div>
          </div>
          <div className="card-body settings-switches">
            {TOGGLES.map((toggle) => (
              <div className="custom-control custom-switch mb-3" key={toggle.key}>
                <input type="hidden" name={`s_${toggle.key}`} value="0" />
                <input
                  type="checkbox"
                  className="custom-control-input"
                  name={`s_${toggle.key}`}
                  value="1"
                  defaultChecked={settings[toggle.key] === '1'}
                  id={`toggle-${toggle.key}`}
                />
                <label className="custom-control-label" htmlFor={`toggle-${toggle.key}`}>{toggle.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-save-bar">
          <p>Changes update the panel name, brand mark, and message everywhere on the next page load.</p>
          <SubmitButton className="btn btn-primary btn-lg" pendingText="Saving identity…">Save panel identity <i className="fe fe-check" /></SubmitButton>
        </div>
      </form>
    </>
  );
}
