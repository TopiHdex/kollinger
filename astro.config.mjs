// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    adapter: vercel({
        edgeMiddleware: true,
    }),
    integrations: [react()],
    image: {
        remotePatterns: [{ protocol: "https" }],
    },
    redirects: {
        '/leistungen': '/',
        '/referenzen': '/',
        '/datenschutz': '/datenschutz-und-impressum',
        '/cookie-policy-eu': '/datenschutz-und-impressum',
        '/Prozesse': '/',
        '/leistungen/prozesse/': '/',
    },
});
