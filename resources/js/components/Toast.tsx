import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type ToastTone = 'success' | 'warning' | 'danger';

type ToastItem = {
    id: number;
    message: string;
    tone: ToastTone;
};

let toastSequence = 0;

const toneStyles: Record<ToastTone, { icon: IconName; iconClassName: string }> =
    {
        success: {
            icon: 'check',
            iconClassName: 'bg-green/10 text-green-deep',
        },
        warning: {
            icon: 'warning',
            iconClassName: 'bg-amber/15 text-amber-deep',
        },
        danger: {
            icon: 'close',
            iconClassName: 'bg-danger/10 text-danger',
        },
    };

export function useToasts() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    useEffect(
        () => () => {
            timers.current.forEach((timer) => clearTimeout(timer));
        },
        [],
    );

    function dismiss(id: number) {
        const timer = timers.current.get(id);

        if (timer) {
            clearTimeout(timer);
        }

        timers.current.delete(id);
        setToasts((items) => items.filter((item) => item.id !== id));
    }

    function push(
        message: string,
        tone: ToastTone = 'success',
        duration: number = tone === 'success' ? 2000 : 3200,
    ) {
        const id = ++toastSequence;
        setToasts((items) => [...items.slice(-2), { id, message, tone }]);
        timers.current.set(
            id,
            setTimeout(() => dismiss(id), duration),
        );

        return id;
    }

    return { toasts, push, dismiss };
}

interface ToastStackProps {
    toasts: ToastItem[];
    onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
    const { gentle } = useSprings();

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4"
        >
            <AnimatePresence>
                {toasts.map((toast) => {
                    const style = toneStyles[toast.tone];

                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: -14, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={gentle}
                            role="status"
                            className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-md border border-line bg-white py-2 pr-3 pl-2 shadow-modal"
                        >
                            <span
                                className={cn(
                                    'flex size-7 shrink-0 items-center justify-center rounded-sm',
                                    style.iconClassName,
                                )}
                            >
                                <Icon name={style.icon} className="size-4" />
                            </span>
                            <p className="min-w-0 flex-1 truncate text-title text-raisin">
                                {toast.message}
                            </p>
                            <button
                                type="button"
                                onClick={() => onDismiss(toast.id)}
                                aria-label="Dismiss notification"
                                className="shrink-0 rounded-sm p-1 text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
                            >
                                <Icon name="close" className="size-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
