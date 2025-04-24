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
    output: 'standalone',
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
};

export default nextConfig;