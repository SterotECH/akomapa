import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from '@/layouts/AppLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Akomapa Neat';

interface PageModule {
    default: ComponentType & {
        layout?: (page: ReactNode) => ReactNode;
    };
}

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    progress: {
        color: '#FFBF00',
    },
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ).then((module) => {
            const page = module as unknown as PageModule;
            page.default.layout =
                page.default.layout ??
                ((page) => <AppLayout>{page}</AppLayout>);

            return page;
        }) as unknown as Promise<ResolvedComponent>,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
