/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    basePath: '/birthday',
    images: {
        unoptimized: true,
    },
    transpilePackages: ['three', '@react-three/drei', '@react-three/fiber', '@react-three/postprocessing', 'maath'],
};

export default nextConfig;
