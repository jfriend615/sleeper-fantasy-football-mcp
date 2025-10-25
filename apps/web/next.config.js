/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },
  transpilePackages: [
    '@sleeper-fantasy-football/core',
    '@sleeper-fantasy-football/mcp-sleeper',
  ],
}

module.exports = nextConfig
