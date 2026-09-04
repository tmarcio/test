/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'nodemailer'],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
