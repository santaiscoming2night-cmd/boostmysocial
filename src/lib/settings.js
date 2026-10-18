import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasServiceRole } from '@/lib/supabase/env';

export const DEFAULT_SETTINGS = {
  website_title: 'Boost My Social',
  website_tagline: 'Social growth, made louder.',
  website_desc:
    'Boost My Social - #1 SMM Reseller Panel - Best SMM Panel for Resellers. SMM Panel for Facebook, Instagram, YouTube and more services!',
  website_keywords:
    'smm panel, smm reseller panel, smm provider panel, reseller panel, instagram panel, social media reseller panel',
  website_logo: '/assets/images/logo.png',
  website_logo_white: '/assets/images/logo-white.png',
  website_favicon: '/assets/images/favicon.png',
  currency_code: 'USD',
  currency_symbol: '$',
  currency_decimal: '2',
  currency_decimal_separator: 'dot',
  currency_thousand_separator: 'comma',
  enable_api_tab: '1',
  enable_service_list_no_login: '1',
  disable_signup_page: '0',
  enable_news_announcement: '1',
  enable_notification_popup: '0',
  enable_explication_service_symbol: '1',
  copy_right_content: 'Copyright &copy; 2020 - Boost My Social',
  social_facebook_link: '',
  social_twitter_link: '',
  social_instagram_link: '',
  social_youtube_link: '',
  social_pinterest_link: '',
  social_tumblr_link: '',
  terms_page_slug: 'terms',
  cookie_policy_slug: 'cookie-policy',
  minimum_deposit: '5',
};

/** Settings cached for the lifetime of one request. */
export const getSettings = cache(async () => {
  if (!hasServiceRole()) return { ...DEFAULT_SETTINGS };
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('settings').select('key, value');
    const map = { ...DEFAULT_SETTINGS };
    (data || []).forEach((row) => {
      if (row.key) map[row.key] = row.value ?? '';
    });
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
});

export function setting(settings, key, fallback = '') {
  const value = settings?.[key];
  return value === undefined || value === null || value === '' ? fallback : value;
}

export function settingOn(settings, key) {
  const v = String(settings?.[key] ?? '').toLowerCase();
  return v === '1' || v === 'true' || v === 'on' || v === 'yes';
}
