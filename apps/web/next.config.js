/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },
}

module.exports = nextConfig
