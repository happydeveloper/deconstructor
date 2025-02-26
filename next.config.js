/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // TypeScript 체크를 비활성화합니다!
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // ESLint 체크를 비활성화합니다!
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.test\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    return config;
  }
}

module.exports = nextConfig 