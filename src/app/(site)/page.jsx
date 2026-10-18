import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';
import { t } from '@/lib/format';

export const dynamic = 'force-dynamic';

const FEATURES = [
  { icon: 'fe fe-calendar', title: 'Resellers', text: 'you_can_resell_our_services_and_grow_your_profit_easily_resellers_are_important_part_of_smm_panel' },
  { icon: 'fe fe-phone-call', title: 'Supports', text: 'technical_support_for_all_our_services_247_to_help_you' },
  { icon: 'fe fe-star', title: 'high_quality_services', text: 'get_the_best_high_quality_services_and_in_less_time_here' },
  { icon: 'fe fe-upload-cloud', title: 'Updates', text: 'services_are_updated_daily_in_order_to_be_further_improved_and_to_provide_you_with_best_experience' },
  { icon: 'fe fe-share-2', title: 'api_support', text: 'we_have_api_support_for_panel_owners_so_you_can_resell_our_services_easily' },
  { icon: 'fe fe-dollar-sign', title: 'secure_payments', text: 'we_have_a_popular_methods_as_paypal_and_many_more_can_be_enabled_upon_request' },
];

const STEPS = [
  { title: 'register_and_log_in', text: 'creating_an_account_is_the_first_step_then_you_need_to_log_in' },
  { title: 'add_funds', text: 'next_pick_a_payment_method_and_add_funds_to_your_account' },
  { title: 'select_a_service', text: 'select_the_services_you_want_and_get_ready_to_receive_more_publicity' },
  { title: 'enjoy_superb_results', text: 'you_can_enjoy_incredible_results_when_your_order_is_complete' },
];

const FAQS = [
  { q: 'smm_panels__what_are_they', a: 'an_smm_panel_is_an_online_shop_that_you_can_visit_to_puchase_smm_services_at_great_prices' },
  { q: 'what_smm_services_can_i_find_on_this_panel', a: 'we_sell_different_types_of_smm_services__likes_followers_views_etc' },
  { q: 'are_smm_services_on_your_panel_safe_to_buy', a: 'sure_your_accounts_wont_get_banned' },
  { q: 'how_does_a_mass_order_work', a: 'its_possible_to_place_multiple_orders_with_different_links_at_once_with_the_help_of_the_mass_order_feature' },
  { q: 'what_does_dripfeed_mean', a: 'grow_your_accounts_as_fast_as_you_want_with_the_help_of_dripfeed_how_it_works_lets_say_you_want_2000_likes_on_your_post_instead_of_getting_all_2000_at_once_you_can_get_200_each_day_for_10_days' },
];

export default async function HomePage({ searchParams }) {
  const [settings, user, params] = await Promise.all([getSettings(), getSessionUser(), searchParams]);

  return (
    <main>
      {params?.subscribed ? (
        <div className="container" style={{ paddingTop: 90 }}>
          <div className="alert alert-success mb-0">Thanks for subscribing! We&apos;ll keep you posted.</div>
        </div>
      ) : null}
      <section id="home" className="header-top mheader">
        <div className="intro_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-6">
                <div className="intro_text">
                  <h1>{t('resellers_1_destination_for_smm_services')}</h1>
                  <p>{t('save_time_managing_your_social_account_in_one_panel_where_people_buy_smm_services_such_as_facebook_ads_management_instagram_youtube_twitter_soundcloud_website_ads_and_many_more')}</p>
                  <div className="btn">
                    {user ? (
                      <Link href="/dashboard" className="btn btn-pill btn-gradient btn-signin btn-submit btn-lg">Dashboard</Link>
                    ) : (
                      <Link href="/signup" className="btn btn-pill btn-gradient btn-signin btn-submit btn-lg">{t('get_start_now')}</Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6" data-aos="fade-up" data-aos-duration="500">
                <div className="intro_banner">
                  <img src="/themes/regular/assets/images/header-top.png" alt="SMM panel" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <div className="row justify-content-center m-b-20">
            <div className="col-lg-10">
              <div className="section-title text-center">
                <div className="line m-auto" />
                <h3 className="title">
                  {t('reasons_why_you_should_try_our_panel')} <span>{t('let_us_help_you_build_your_online_presence_quickly_and_efficiently')}</span>
                </h3>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {[
              { icon: 'fe fe-award', shape: 'services-shape-1.svg', title: 'best_quality', text: 'the_highest_quality_smm_services_to_meet_your_needs', delay: 500 },
              { icon: 'fe fe-truck', shape: 'services-shape-2.svg', title: 'diverse_payment_options', text: 'we_have_a_good_amount_of_different_payment_options', delay: 1000 },
              { icon: 'fe fe-clock', shape: 'services-shape-3.svg', title: 'super_quick_delivery', text: 'we_provide_automated_services_with_quick_delivery', delay: 1500 },
            ].map((card) => (
              <div className="col-lg-4 col-md-7 col-sm-8" data-aos="fade-up" data-aos-duration={card.delay} key={card.title}>
                <div className="sigle-service text-center m-t-30">
                  <div className="services-icon">
                    <img className="shape" src="/themes/regular/assets/images/services-shape.svg" alt="shape" />
                    <img className="shape-1" src={`/themes/regular/assets/images/${card.shape}`} alt="shape" />
                    <i className={card.icon} />
                  </div>
                  <div className="services-content m-t-30">
                    <h4 className="services-title">{t(card.title)}</h4>
                    <p className="text">{t(card.text)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="social-icon-area pt-90" data-aos="fade-up" data-aos-duration="1000">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="brand-logo d-flex align-items-center justify-content-center justify-content-md-between">
                {['fb.png', 'ig.png', 'yt.png', 'tw.png', 'sc.png'].map((img) => (
                  <div className="single-logo m-t-30" data-aos="zoom-in" data-aos-duration="1500" key={img}>
                    <img src={`/themes/regular/assets/images/${img}`} alt={img} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="our-features" data-aos="fade-up" data-aos-duration="300">
        <div className="container custom-container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="section-title pb-20">
                <h1>{t('What_we_offer')}</h1>
                <p>{t('comes_with_all_the_essential_features_and_elements_you_need_here_are_the_key_features_of_our_services_you_must_know')}</p>
              </div>
            </div>
          </div>
          <div className="row features-wrapper">
            {FEATURES.map((f) => (
              <div className="col-lg-4 col-sm-6 features-col" data-aos="fade-up" data-aos-duration="1000" key={f.title}>
                <div className="feature-content m-t-30 m-b-30">
                  <div className="features-icon"><i className={f.icon} /></div>
                  <div className="features-content">
                    <h3>{t(f.title)}</h3>
                    <p className="text-muted">{t(f.text)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-1">
        <div className="container">
          <div className="row">
            <div className="col-md-6 p-t-60" data-aos="zoom-in-right" data-aos-duration="1000">
              <div className="content">
                <div className="title p-b-20">{t('best_smm_marketing_services')}</div>
                <div className="desc">{t('best_smm_marketing_services_desc')}</div>
              </div>
            </div>
            <div className="col-md-6" data-aos="zoom-in-up" data-aos-duration="1000">
              <div className="intro-img">
                <img className="img-fluid" src="/themes/regular/assets/images/about.png" alt="About us" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <div className="row text-center" data-aos="fade-up" data-aos-delay="700">
            <div className="col-md-12 mx-auto">
              <div className="header-top">
                <div className="title">{t('how_it_works')}</div>
                <span>{t('by_following_the_processes_below_you_can_make_any_order_you_want')}</span>
              </div>
              <div className="col-md-12">
                <div className="row step-lists">
                  {STEPS.map((step, index) => (
                    <div className="col-sm-6 col-lg-3 step text-left" key={step.title}>
                      <div className="header-name">
                        <h3>{t(step.title)}</h3>
                        <p className="desc">{t(step.text)}</p>
                      </div>
                      <div className="bg-number">{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row package-faq" data-aos="fade-up" data-aos-delay="1000">
            <div className="col-md-12">
              <div className="header-top text-center">
                <div className="title">F.A.Q</div>
              </div>
              <div className="row">
                {[FAQS.slice(0, 3), FAQS.slice(3)].map((column, columnIndex) => (
                  <div className="col-md-6" key={columnIndex}>
                    {column.map((item) => (
                      <details className="item" key={item.q}>
                        <summary className="title">
                          <i className="fe fe-plus plus-icon" />
                          <h5>{t(item.q)}</h5>
                        </summary>
                        <div className="body">{t(item.a)}</div>
                      </details>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-60 pb-60">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="m-b-20">{settings.website_title}</h2>
              <p className="text-muted">{settings.website_desc}</p>
              <Link href="/signup" className="btn btn-pill btn-gradient btn-signin btn-submit btn-lg">{t('get_start_now')}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
