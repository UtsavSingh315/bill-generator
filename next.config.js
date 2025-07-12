/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config, { isServer }) => {
    // Handle ExcelJS and other large libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util"),
        buffer: require.resolve("buffer"),
      };
    }

    // Optimize chunk splitting for large libraries
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          exceljs: {
            name: "exceljs",
            test: /[\\/]node_modules[\\/]exceljs[\\/]/,
            chunks: "all",
            priority: 20,
          },
          jszip: {
            name: "jszip",
            test: /[\\/]node_modules[\\/]jszip[\\/]/,
            chunks: "all",
            priority: 20,
          },
        },
      },
    };

    return config;
  },
};

module.exports = nextConfig;
