/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.31.222'],
  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: ['jspdf', 'html2canvas', 'fflate'],
}

export default nextConfig
