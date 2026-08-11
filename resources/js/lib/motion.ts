import { useSyncExternalStore } from 'react';

export const springs = {
    wobbly: { type: 'spring', bounce: 0.35, duration: 0.55 } as const,
    gentle: { type: 'spring', bounce: 0.25, duration: 0.45 } as const,
    fast: { duration: 0.12 } as const,
} as const;

function subscribeToReducedMotion(callback: () => void) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', callback);

    return () => media.removeEventListener('change', callback);
}

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribeToReducedMotion,
        prefersReducedMotion,
        () => false,
    );
}

export function useSprings() {
    const reduced = usePrefersReducedMotion();

    return {
        reduced,
        wobbly: reduced ? springs.fast : springs.wobbly,
        gentle: reduced ? springs.fast : springs.gentle,
        fast: springs.fast,
    };
}
