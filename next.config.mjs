/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // Arena previews are served through an e2b.app subdomain during development.
  allowedDevOrigins: ['*.e2b.app'],
  async redirects() {
    return [
      { source: '/terms', destination: '/page/terms', permanent: false },
      { source: '/cookie-policy', destination: '/page/cookie-policy', permanent: false },
      { source: '/order', destination: '/order/log', permanent: false },
      { source: '/order/logs', destination: '/order/log', permanent: false },
      { source: '/statistics', destination: '/dashboard', permanent: false },
      { source: '/auth/login', destination: '/login', permanent: false },
      { source: '/auth/signup', destination: '/signup', permanent: false },
    ];
  },
};
export default nextConfig;
