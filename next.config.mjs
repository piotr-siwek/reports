/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config, { isServer, dev }) {
        // Dodajemy regułę dla fontów
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
                        name(module) {
                            // Get the name of the npm package
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1] || 'unknown';
                            // Return a unique name for the chunk
                            return `npm.${packageName.replace('@', '')}`;
                        },
                    },
                },
            };
        }

        // Add polyfills for Cloudflare Workers environment
        if (!isServer && !dev) {
            // Fallbacks for Node.js modules
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                module: false,
                path: false,
                os: false,
                crypto: false,
            };
            
            // Add GlobalThis polyfill and other environment variables
            config.plugins = [
                ...config.plugins || [],
                // Workaround for self not defined
                {
                    apply: (compiler) => {
                        compiler.hooks.compilation.tap('ReplacePlugin', compilation => {
                            compilation.hooks.processAssets.tap(
                                {
                                    name: 'ReplacePlugin',
                                    stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE
                                },
                                () => {
                                    Object.keys(compilation.assets).forEach(key => {
                                        if (key.endsWith('.js')) {
                                            const asset = compilation.assets[key];
                                            const source = asset.source();
                                            
                                            // Replace references to 'self' with 'globalThis'
                                            const newSource = source.replace(/\bself\b/g, 'globalThis');
                                            compilation.assets[key] = {
                                                source: () => newSource,
                                                size: () => newSource.length
                                            };
                                        }
                                    });
                                }
                            );
                        });
                    }
                }
            ];
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