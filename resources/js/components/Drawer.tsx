import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { Icon } from '@/components/Icon';
import { useSprings } from '@/lib/motion';

interface DrawerProps extends PropsWithChildren {
    open: boolean;
    onClose: () => void;
    title: string;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
    const { gentle } = useSprings();

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 bg-raisin/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={gentle}
                    onClick={onClose}
                >
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-modal"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={gentle}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-line px-6 py-4">
                            <h2 className="text-headline text-raisin">
                                {title}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="rounded-md p-1 text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
                            >
                                <Icon name="close" className="size-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {children}
                        </div>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
