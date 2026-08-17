import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { index as pos } from '@/routes/pos';
import { index as products } from '@/routes/products';
import { index as reports } from '@/routes/reports';
import { index as stock } from '@/routes/stock';

const SIDEBAR_STORAGE_KEY = 'akomapa-sidebar';

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
    const [sidebarOpen, setSidebarOpen] = useState(
        () =>
            typeof window !== 'undefined' &&
            localStorage.getItem(SIDEBAR_STORAGE_KEY) !== '0',
    );

    function toggleSidebar() {
        setSidebarOpen((open) => {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? '0' : '1');

            return !open;
        });
    }

    return (
        <div className="flex min-h-screen">
            <header className="app-topbar fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-linen/95 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        aria-label={
                            sidebarOpen ? 'Hide sidebar' : 'Show sidebar'
                        }
                        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                        className="hidden rounded-md p-2 text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin lg:block"
                    >
                        <Icon name="menu" className="size-5" />
                    </button>

                    <p className="hidden text-wordmark whitespace-nowrap text-raisin sm:block">
                        Akomapa{' '}
                        <span className="text-amber">
                            Neat<span className="text-green">.</span>
                        </span>
                    </p>

                    <span className="hidden h-5 w-px bg-line sm:block" />

                    <h1 className="truncate text-display text-raisin">
                        {active.label}
                    </h1>
                </div>

                <div className="flex items-center gap-1">
                    <ThemeToggle />
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

            <aside
                className={cn(
                    'app-sidebar fixed top-16 bottom-0 left-0 z-20 hidden w-32 flex-col bg-chrome px-2 py-6 text-chrome-text transition-transform duration-fast lg:flex',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <nav className="flex flex-col gap-1">
                    {nav.map((item) => {
                        const isActive = item.href === active.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'relative flex flex-col items-center gap-1.5 rounded-md px-1 py-3 transition-colors duration-fast',
                                    isActive
                                        ? 'text-amber'
                                        : 'text-chrome-text/60 hover:bg-chrome-text/5 hover:text-chrome-text',
                                )}
                            >
                                {isActive && (
                                    <span className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-full bg-amber" />
                                )}
                                <Icon name={item.name} className="size-10" />
                                <span className="text-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <Link
                        href={logout.url()}
                        method="post"
                        as="button"
                        className="flex w-full flex-col items-center gap-1.5 rounded-md px-1 py-3 text-chrome-text/60 transition-colors duration-fast hover:bg-chrome-text/5 hover:text-chrome-text"
                    >
                        <Icon name="logout" className="size-5" />
                        <span className="text-label">Log out</span>
                    </Link>
                </div>
            </aside>

            <nav className="app-bottomnav fixed inset-x-0 bottom-0 z-20 flex border-t border-chrome-text/10 bg-chrome lg:hidden">
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
                                    : 'text-chrome-text/60 hover:bg-chrome-text/5 hover:text-chrome-text',
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

            <div
                className={cn(
                    'flex min-h-screen flex-1 flex-col pt-16 pb-16 transition-[margin-left] duration-fast lg:pb-0',
                    sidebarOpen ? 'lg:ml-32' : 'lg:ml-0',
                )}
            >
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
