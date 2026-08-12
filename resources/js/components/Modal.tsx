import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { Icon } from '@/components/Icon';
import { useSprings } from '@/lib/motion';

interface ModalProps extends PropsWithChildren {
    open: boolean;
    onClose: () => void;
    title: string;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-chrome/60 p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={gentle}
                    onClick={onClose}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="w-full max-w-lg rounded-lg bg-white shadow-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
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
                        <div className="px-6 py-4">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
