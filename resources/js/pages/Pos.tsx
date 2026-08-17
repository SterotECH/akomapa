import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Drawer } from '@/components/Drawer';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { SearchField } from '@/components/Input';
import { Money } from '@/components/Money';
import { StockDot } from '@/components/StockDot';
import { ToastStack, useToasts } from '@/components/Toast';
import type { ToastTone } from '@/components/Toast';
import { formatGhs } from '@/lib/format';
import {
    activeProducts,
    categories as mockCategories,
    todaySales as mockTodaySales,
} from '@/lib/mock-data';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { CartLine, Category, Product } from '@/types';

const SEARCH_ID = 'pos-search';
const MAX_SCAN_LENGTH = 40;

type PosPageProps = {
    products?: Product[];
    categories?: Category[];
    todaySales?: { count: number; total: number };
};

export default function Pos({
    products = activeProducts,
    categories = mockCategories,
    todaySales = mockTodaySales,
}: PosPageProps) {
    const { wobbly } = useSprings();
    const { toasts, push, dismiss } = useToasts();
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartLine[]>([]);
    const [scanBuffer, setScanBuffer] = useState('');
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

    const scanBufferRef = useRef('');
    const addToCartRef = useRef<(product: Product) => void>(() => {});
    const notifyRef = useRef<(message: string, tone?: ToastTone) => void>(
        () => {},
    );

    useEffect(() => {
        addToCartRef.current = addToCart;
        notifyRef.current = push;
    });

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                categoryId === null || product.category?.id === categoryId;
            const matchesSearch =
                term.length === 0 ||
                product.name.toLowerCase().includes(term) ||
                product.sku.toLowerCase().includes(term);

            return matchesCategory && matchesSearch;
        });
    }, [products, search, categoryId]);

    const total = useMemo(
        () => cart.reduce((sum, line) => sum + line.line_total, 0),
        [cart],
    );

    const itemCount = useMemo(
        () => cart.reduce((sum, line) => sum + line.quantity, 0),
        [cart],
    );

    function addToCart(product: Product) {
        if (product.stock_on_hand <= 0) {
            push(`${product.name} is out of stock`, 'danger');

            return;
        }

        setCart((lines) => {
            const existing = lines.find(
                (line) => line.product_id === product.id,
            );

            if (existing) {
                if (existing.quantity >= product.stock_on_hand) {
                    push(
                        `Only ${product.stock_on_hand} ${product.unit} in stock`,
                        'warning',
                    );

                    return lines;
                }

                return lines.map((line) =>
                    line.product_id === product.id
                        ? {
                              ...line,
                              quantity: line.quantity + 1,
                              line_total: (line.quantity + 1) * line.unit_price,
                          }
                        : line,
                );
            }

            return [
                ...lines,
                {
                    product_id: product.id,
                    sku: product.sku,
                    name: product.name,
                    unit: product.unit,
                    unit_price: product.selling_price,
                    quantity: 1,
                    line_total: product.selling_price,
                    stock_on_hand: product.stock_on_hand,
                },
            ];
        });

        push(`Added ${product.name}`, 'success');
    }

    function increment(line: CartLine) {
        if (line.quantity >= line.stock_on_hand) {
            push(`Only ${line.stock_on_hand} ${line.unit} in stock`, 'warning');

            return;
        }

        setCart((lines) =>
            lines.map((candidate) =>
                candidate.product_id === line.product_id
                    ? {
                          ...candidate,
                          quantity: candidate.quantity + 1,
                          line_total:
                              (candidate.quantity + 1) * candidate.unit_price,
                      }
                    : candidate,
            ),
        );
    }

    function decrement(line: CartLine) {
        setCart((lines) =>
            lines
                .map((candidate) =>
                    candidate.product_id === line.product_id
                        ? {
                              ...candidate,
                              quantity: candidate.quantity - 1,
                              line_total:
                                  (candidate.quantity - 1) *
                                  candidate.unit_price,
                          }
                        : candidate,
                )
                .filter((candidate) => candidate.quantity > 0),
        );
    }

    function removeLine(productId: string) {
        setCart((lines) =>
            lines.filter((line) => line.product_id !== productId),
        );
    }

    function setUnitPrice(productId: string, pesewas: number) {
        setCart((lines) =>
            lines.map((line) =>
                line.product_id === productId
                    ? {
                          ...line,
                          unit_price: pesewas,
                          line_total: line.quantity * pesewas,
                      }
                    : line,
            ),
        );
    }

    function completeSale() {
        if (cart.length === 0) {
            return;
        }

        const message = `Sale complete · ${itemCount} item${itemCount === 1 ? '' : 's'} · ${formatGhs(total)}`;
        setCart([]);
        setCartDrawerOpen(false);
        push(message, 'success');
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement;
            const isTyping =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable;

            if (event.key === '/' && !isTyping) {
                event.preventDefault();
                document.getElementById(SEARCH_ID)?.focus();

                return;
            }

            if (isTyping || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }

            if (event.key === 'Enter') {
                const code = scanBufferRef.current;

                if (code.length > 0) {
                    event.preventDefault();
                    scanBufferRef.current = '';
                    setScanBuffer('');

                    const product = products.find(
                        (candidate) => candidate.barcode === code,
                    );

                    if (product) {
                        addToCartRef.current(product);
                        notifyRef.current(`Scanned ${product.name}`, 'success');
                    } else {
                        notifyRef.current(`No match for ${code}`, 'danger');
                    }
                }

                return;
            }

            if (event.key === 'Escape') {
                scanBufferRef.current = '';
                setScanBuffer('');

                return;
            }

            if (event.key.length === 1) {
                scanBufferRef.current += event.key;

                if (scanBufferRef.current.length > MAX_SCAN_LENGTH) {
                    scanBufferRef.current = '';
                }

                setScanBuffer(scanBufferRef.current);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [products]);

    return (
        <>
            <Head title="POS" />

            <div className="flex h-[calc(100dvh-10rem)] flex-col gap-4 sm:h-[calc(100dvh-11rem)] md:overflow-hidden lg:h-[calc(100dvh-7rem)] lg:flex-row">
                <section className="flex min-h-0 flex-1 flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <SearchField
                            id={SEARCH_ID}
                            className="flex-1"
                            placeholder="Search by name or SKU…"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search products"
                        />
                        <span
                            className={cn(
                                'flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-2 text-label font-semibold transition-colors duration-fast',
                                scanBuffer.length > 0
                                    ? 'text-amber-deep'
                                    : 'text-spanish-gray',
                            )}
                            role="status"
                            title="Keyboard-wedge barcode scan listening"
                        >
                            <Icon name="barcode" className="size-4" />
                            {scanBuffer.length > 0 ? 'Scanning…' : 'Scan'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-2 overflow-x-auto pb-0.5">
                            <button
                                type="button"
                                onClick={() => setCategoryId(null)}
                                className={cn(
                                    'min-h-11 shrink-0 rounded-full border px-3 py-1.5 text-label font-semibold transition-colors duration-fast',
                                    categoryId === null
                                        ? 'border-amber bg-amber/15 text-amber-deep'
                                        : 'border-line bg-white text-spanish-gray hover:bg-raisin/5 hover:text-raisin',
                                )}
                            >
                                All
                            </button>
                            {categories.map((category) => {
                                const isActive = category.id === categoryId;

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() =>
                                            setCategoryId(
                                                isActive ? null : category.id,
                                            )
                                        }
                                        className={cn(
                                            'min-h-11 shrink-0 rounded-full border px-3 py-1.5 text-label font-semibold transition-colors duration-fast',
                                            isActive
                                                ? 'border-amber bg-amber/15 text-amber-deep'
                                                : 'border-line bg-white text-spanish-gray hover:bg-raisin/5 hover:text-raisin',
                                        )}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="hidden shrink-0 text-label text-spanish-gray md:block">
                            Today · {todaySales.count} items ·{' '}
                            <span className="tabular-nums">
                                {formatGhs(todaySales.total)}
                            </span>
                        </p>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pb-24 md:pb-0">
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 content-start gap-3 pb-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {filtered.map((product) => {
                                    const out = product.stock_on_hand <= 0;

                                    return (
                                        <motion.button
                                            key={product.id}
                                            type="button"
                                            layout
                                            whileTap={{ scale: 0.97 }}
                                            transition={wobbly}
                                            onClick={() => addToCart(product)}
                                            disabled={out}
                                            className="group flex flex-col rounded-md border border-line bg-white p-3 text-left shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-raised active:translate-y-[3px] disabled:pointer-events-none disabled:opacity-50"
                                            aria-label={`Add ${product.name} to cart`}
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-1.5">
                                                    <StockDot
                                                        low={
                                                            product.is_low_stock
                                                        }
                                                    />
                                                    {product.is_low_stock && (
                                                        <Badge variant="amber">
                                                            Low
                                                        </Badge>
                                                    )}
                                                    {out && (
                                                        <Badge variant="muted">
                                                            Out
                                                        </Badge>
                                                    )}
                                                </span>
                                            </span>
                                            <span className="mt-2 truncate text-title text-raisin">
                                                {product.name}
                                            </span>
                                            <span className="mt-0.5 truncate text-label text-spanish-gray">
                                                {product.sku} ·{' '}
                                                {product.stock_on_hand}{' '}
                                                {product.unit}
                                            </span>
                                            <span className="mt-3 flex items-baseline justify-between gap-2 border-t border-line pt-2.5">
                                                <Money
                                                    pesewas={
                                                        product.selling_price
                                                    }
                                                    className="text-figure text-raisin"
                                                />
                                                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-amber/15 text-amber-deep transition-colors duration-fast group-hover:bg-amber group-hover:text-amber-ink">
                                                    <Icon
                                                        name="plus"
                                                        className="size-5"
                                                    />
                                                </span>
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon="search"
                                title="No products found"
                                description="Try a different name, SKU, or category."
                            />
                        )}
                    </div>
                </section>

                <aside className="hidden md:block md:max-h-80 md:shrink-0 lg:max-h-none lg:w-96">
                    <Card className="flex h-full flex-col overflow-hidden">
                        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-2">
                                <h2 className="text-headline text-raisin">
                                    Cart
                                </h2>
                                {itemCount > 0 && (
                                    <Badge variant="amber">{itemCount}</Badge>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-label tracking-wide text-spanish-gray uppercase">
                                    Total
                                </p>
                                <Money
                                    pesewas={total}
                                    className="text-headline text-raisin"
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <CartLines
                                cart={cart}
                                onIncrement={increment}
                                onDecrement={decrement}
                                onRemove={removeLine}
                                onUnitPrice={setUnitPrice}
                            />
                        </div>

                        <div className="border-t border-line p-4 sm:px-5">
                            <Button
                                className="w-full"
                                disabled={cart.length === 0}
                                onClick={completeSale}
                            >
                                <Icon name="check" className="size-4" />
                                Complete Sale
                            </Button>
                        </div>
                    </Card>
                </aside>
            </div>

            {cart.length > 0 && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={wobbly}
                    className="fixed inset-x-0 bottom-16 z-20 flex justify-center px-4 md:hidden"
                >
                    <button
                        type="button"
                        onClick={() => setCartDrawerOpen(true)}
                        className="flex w-full min-h-14 max-w-lg items-center justify-between gap-3 rounded-lg bg-chrome px-4 py-3 text-chrome-text shadow-modal"
                        aria-label={`Open cart with ${itemCount} items, total ${formatGhs(total)}`}
                    >
                        <span className="flex items-center gap-2.5">
                            <span className="relative">
                                <Icon name="cart" className="size-5" />
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-label text-amber-ink tabular-nums">
                                    {itemCount}
                                </span>
                            </span>
                            <Money pesewas={total} className="text-title" />
                        </span>
                        <span className="flex items-center gap-1 text-label font-semibold tracking-wide uppercase">
                            View cart
                            <Icon name="arrow-right" className="size-4" />
                        </span>
                    </button>
                </motion.div>
            )}

            <Drawer
                open={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
                title={`Cart · ${itemCount} item${itemCount === 1 ? '' : 's'}`}
                footer={
                    <>
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-label tracking-wide text-spanish-gray uppercase">
                                Total
                            </span>
                            <Money
                                pesewas={total}
                                className="text-headline text-raisin"
                            />
                        </div>
                        <Button
                            className="w-full"
                            disabled={cart.length === 0}
                            onClick={completeSale}
                        >
                            <Icon name="check" className="size-4" />
                            Complete Sale
                        </Button>
                    </>
                }
            >
                <CartLines
                    cart={cart}
                    onIncrement={increment}
                    onDecrement={decrement}
                    onRemove={removeLine}
                    onUnitPrice={setUnitPrice}
                />
            </Drawer>

            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </>
    );
}

function CartLines({
    cart,
    onIncrement,
    onDecrement,
    onRemove,
    onUnitPrice,
}: {
    cart: CartLine[];
    onIncrement: (line: CartLine) => void;
    onDecrement: (line: CartLine) => void;
    onRemove: (productId: string) => void;
    onUnitPrice: (productId: string, pesewas: number) => void;
}) {
    const { gentle } = useSprings();

    if (cart.length === 0) {
        return (
            <div className="px-4 py-10 sm:px-5">
                <EmptyState
                    icon="cart"
                    title="Your cart is empty"
                    description="Start typing or scan a barcode to add the first product."
                />
            </div>
        );
    }

    return (
        <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
                {cart.map((line) => (
                    <motion.li
                        key={line.product_id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={gentle}
                    >
                        <div className="flex items-start gap-3 px-4 py-3 sm:px-5">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-title text-raisin">
                                    {line.name}
                                </p>
                                <p className="text-label text-spanish-gray">
                                    {line.sku}
                                </p>
                                <PriceInput
                                    key={line.unit_price}
                                    pesewas={line.unit_price}
                                    onCommit={(value) =>
                                        onUnitPrice(line.product_id, value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => onRemove(line.product_id)}
                                    aria-label={`Remove ${line.name} from cart`}
                                    className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-danger"
                                >
                                    <Icon name="close" className="size-4" />
                                </button>

                                <div className="flex items-center rounded-md border border-line bg-white">
                                    <button
                                        type="button"
                                        onClick={() => onDecrement(line)}
                                        aria-label={`Decrease quantity of ${line.name}`}
                                        className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-raisin transition-colors duration-fast hover:bg-raisin/5"
                                    >
                                        <Icon name="minus" className="size-4" />
                                    </button>
                                    <span
                                        className="min-w-8 text-center text-figure text-raisin tabular-nums"
                                        aria-label={`Quantity ${line.quantity}`}
                                    >
                                        {line.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onIncrement(line)}
                                        aria-label={`Increase quantity of ${line.name}`}
                                        className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-raisin transition-colors duration-fast hover:bg-raisin/5"
                                    >
                                        <Icon name="plus" className="size-4" />
                                    </button>
                                </div>

                                <Money
                                    pesewas={line.line_total}
                                    className="text-figure text-raisin"
                                />
                            </div>
                        </div>
                    </motion.li>
                ))}
            </AnimatePresence>
        </ul>
    );
}

function PriceInput({
    pesewas,
    onCommit,
}: {
    pesewas: number;
    onCommit: (pesewas: number) => void;
}) {
    const [draft, setDraft] = useState((pesewas / 100).toFixed(2));

    function commit() {
        const value = Number.parseFloat(draft);

        if (Number.isFinite(value) && value >= 0) {
            onCommit(Math.round(value * 100));
        } else {
            setDraft((pesewas / 100).toFixed(2));
        }
    }

    return (
        <input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }
            }}
            aria-label="Unit price in GHS"
            className="mt-0.5 w-20 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-figure text-spanish-gray tabular-nums transition-all duration-fast outline-none focus:border-line focus:bg-white focus:text-raisin focus:ring-2 focus:ring-amber"
        />
    );
}
