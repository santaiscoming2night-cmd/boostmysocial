import { getSettings } from '@/lib/settings';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { saveSettings } from '@/app/actions/admin';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

const FIELDS = [
  { key: 'website_title', label: 'Website title' },
  { key: 'website_desc', label: 'Meta description', type: 'textarea' },
  { key: 'website_keywords', label: 'Meta keywords', type: 'textarea' },
  { key: 'website_logo', label: 'Logo URL' },
  { key: 'website_logo_white', label: 'White logo URL' },
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
      <PageTitle icon="fe fe-settings">Settings</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <form action={saveSettings}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Website</h3></div>
          <div className="card-body">
            <div className="row">
              {FIELDS.map((field) => (
                <div className={field.type === 'textarea' ? 'col-12' : 'col-md-6'} key={field.key}>
                  <div className="form-group">
                    <label className="form-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea name={`s_${field.key}`} defaultValue={settings[field.key] || ''} className="form-control" rows={2} />
                    ) : (
                      <input name={`s_${field.key}`} defaultValue={settings[field.key] || ''} className="form-control" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Features</h3></div>
          <div className="card-body">
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

        <SubmitButton className="btn btn-primary btn-lg" pendingText="Saving…">Save settings</SubmitButton>
      </form>
    </>
  );
}
