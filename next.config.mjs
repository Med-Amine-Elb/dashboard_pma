/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'recharts', 
      'date-fns', 
      '@radix-ui/react-icons', 
      'echarts-for-react',
      'exceljs'
    ],
  },
}

export default nextConfig;
