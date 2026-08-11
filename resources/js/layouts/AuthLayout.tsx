import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            <aside className="hidden w-2/5 flex-col bg-raisin px-10 py-10 text-white lg:flex xl:px-12">
                <p className="text-wordmark text-white">
                    Akomapa{' '}
                    <span className="text-amber">
                        Neat<span className="text-green">.</span>
                    </span>
                </p>

                <div className="my-auto max-w-sm">
                    <p className="text-display leading-tight text-white">
                        Neat stock. Neat money.
                    </p>
                    <p className="mt-4 text-body leading-relaxed text-white/60">
                        One tidy point-of-sale and inventory record for the
                        shop. Sign in to get to the counter.
                    </p>
                </div>

                <p className="text-label text-white/40">
                    Single-owner login · Akomapa Neat Enterprise
                </p>
            </aside>

            <main className="flex min-h-screen flex-1 items-center justify-center bg-linen px-6 py-12">
                {children}
            </main>
        </div>
    );
}
