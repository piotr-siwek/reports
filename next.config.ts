import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack(config) {
        config.module.rules.push({
            test: /\.(ttf|woff|woff2|otf)$/,
            type: 'asset/resource',
            generator: { filename: 'static/fonts/[name].[hash][ext]' }
        });
        
        // Reduce chunk size to avoid Cloudflare's 25MB limit
        if (config.optimization && process.env.NODE_ENV === 'production') {
            config.optimization.splitChunks = {
                chunks: 'all',
                maxInitialRequests: Infinity,
                minSize: 20000,
                maxSize: 20 * 1024 * 1024, // 20 MB max chunk size
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module: { context: string }) {
                            // Get the name of the npm package
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1] || 'unknown';
                            // Return a unique name for the chunk
                            return `npm.${packageName.replace('@', '')}`;
                        },
                    },
                },
            };
        }
        
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