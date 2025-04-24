import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack(config) {
        config.module.rules.push({
            test: /\.(ttf|woff|woff2|otf)$/,
            type: 'asset/resource',
            generator: { filename: 'static/fonts/[name].[hash][ext]' }
        });
        
        return config;
    },
    // Optimize for Cloudflare Pages
    output: 'standalone',
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    // For cloudflare
    images: {
        unoptimized: true // Cloudflare Pages doesn't support the default Next.js image optimization
    },
};

export default nextConfig;