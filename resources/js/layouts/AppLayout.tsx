import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { index as pos } from '@/routes/pos';
import { index as products } from '@/routes/products';
import { index as reports } from '@/routes/reports';
import { index as stock } from '@/routes/stock';

const nav: { name: IconName; label: string; href: string }[] = [
    { name: 'dashboard', label: 'Dashboard', href: dashboard.url() },
    { name: 'pos', label: 'POS', href: pos.url() },
    { name: 'products', label: 'Products', href: products.url() },
    { name: 'stock', label: 'Stock', href: stock.url() },
    { name: 'reports', label: 'Reports', href: reports.url() },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const active = nav.find((item) => item.href === url) ?? nav[0];

    return (
        <div className="flex min-h-screen">
            <aside className="app-sidebar fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-raisin px-4 py-6 text-white lg:flex">
                <p className="px-3 text-wordmark text-white">
                    Akomapa{' '}
                    <span className="text-amber">
                        Neat<span className="text-green">.</span>
                    </span>
                </p>

                <nav className="mt-8 flex flex-col gap-1">
                    {nav.map((item) => {
                        const isActive = item.href === active.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-title transition-colors duration-fast',
                                    isActive
                                        ? 'bg-white/10 text-amber'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white',
                                )}
                            >
                                {isActive && (
                                    <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-amber" />
                                )}
                                <Icon name={item.name} className="size-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <Link
                        href={logout.url()}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-title text-white/60 transition-colors duration-fast hover:bg-white/5 hover:text-white"
                    >
                        <Icon name="logout" className="size-5" />
                        Log out
                    </Link>
                </div>
            </aside>

            <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-raisin lg:hidden">
                {nav.map((item) => {
                    const isActive = item.href === active.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 transition-colors duration-fast',
                                isActive
                                    ? 'text-amber'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                            )}
                        >
                            {isActive && (
                                <span className="absolute top-0 h-0.5 w-10 rounded-full bg-amber" />
                            )}
                            <Icon name={item.name} className="size-5" />
                            <span className="text-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="flex min-h-screen flex-1 flex-col pb-16 lg:ml-64 lg:pb-0">
                <header className="app-topbar sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-line bg-linen/95 px-4 sm:px-6">
                    <h1 className="text-display text-raisin">{active.label}</h1>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-line bg-white px-3 py-1 text-label text-spanish-gray">
                            Synthetic data
                        </span>
                        <Link
                            href={logout.url()}
                            method="post"
                            as="button"
                            aria-label="Log out"
                            className="rounded-md p-2 text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin lg:hidden"
                        >
                            <Icon name="logout" className="size-5" />
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-6 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
