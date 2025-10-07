/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      canvas: false,
      encoding: false,
    };
    
    return config;
  },
};

export default nextConfig;