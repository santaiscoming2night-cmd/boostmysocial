import Link from 'next/link';

export default function LandingFooter({ settings }) {
  return (
    <>
      <div className="footer footer_top dark">
        <div className="container m-t-60 m-b-50">
          <div className="row">
            <div className="col-lg-12">
              <div className="site-logo m-b-30">
                <Link href="/" className="m-r-20">
                  <img src={settings.website_logo_white || '/assets/images/logo-white.png'} alt="Website logo" />
                </Link>
              </div>
            </div>
            <div className="col-lg-8 m-t-30 mt-lg-0">
              <h4 className="title">Quick links</h4>
              <div className="row">
                <div className="col-6 col-md-3 mt-lg-0">
                  <ul className="list-unstyled quick-link mb-0">
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/login">Login</Link></li>
                    <li><Link href="/signup">Sign Up</Link></li>
                  </ul>
                </div>
                <div className="col-6 col-md-3">
                  <ul className="list-unstyled quick-link mb-0">
                    <li><Link href="/page/terms">Terms &amp; Conditions</Link></li>
                    <li><Link href="/page/cookie-policy">Cookie Policy</Link></li>
                    <li><Link href="/api/docs">API documentation</Link></li>
                    <li><Link href="/faq">FAQs</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4 m-t-30 mt-lg-0 subscribe-form" id="subscribe">
              <h4 className="title">Subscribe Us</h4>
              <form action="/api/subscribe" method="post" className="form">
                <div className="form-group">
                  <input type="email" name="email" className="form-control email" placeholder="Enter Your email" required />
                </div>
                <button className="form-control btn btn-pill btn-gradient btn-signin btn-submit" type="submit">Subscribe now</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer footer_bottom dark">
        <div className="container">
          <div className="row align-items-center flex-row-reverse">
            <div className="col-auto ml-lg-auto">
              <ul className="list-inline mb-0">
                {settings.social_facebook_link ? <li className="list-inline-item"><a href={settings.social_facebook_link} target="_blank" rel="noreferrer" className="btn btn-icon btn-facebook"><i className="fa fa-facebook" /></a></li> : null}
                {settings.social_twitter_link ? <li className="list-inline-item"><a href={settings.social_twitter_link} target="_blank" rel="noreferrer" className="btn btn-icon btn-twitter"><i className="fa fa-twitter" /></a></li> : null}
                {settings.social_instagram_link ? <li className="list-inline-item"><a href={settings.social_instagram_link} target="_blank" rel="noreferrer" className="btn btn-icon btn-instagram"><i className="fa fa-instagram" /></a></li> : null}
                {settings.social_youtube_link ? <li className="list-inline-item"><a href={settings.social_youtube_link} target="_blank" rel="noreferrer" className="btn btn-icon btn-youtube"><i className="fa fa-youtube" /></a></li> : null}
              </ul>
            </div>
            <div className="col-12 col-lg-auto mt-3 mt-lg-0 text-center">
              <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || '' }} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
