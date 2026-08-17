import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/Input';
import { Money } from '@/components/Money';
import { StockDot } from '@/components/StockDot';
import {
    Cell,
    DataTable,
    HeaderCell,
    TableBody,
    TableHead,
    TableRow,
} from '@/components/Table';
import { ToastStack, useToasts } from '@/components/Toast';
import { formatGhs, formatSignedQuantity, formatWhen } from '@/lib/format';
import {
    activeProducts,
    stockMovements as mockMovements,
} from '@/lib/mock-data';
import { createMockId } from '@/lib/mock-id';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { MovementType, Product, StockMovement } from '@/types';

const movementBadge: Record<
    MovementType,
    { variant: 'amber' | 'green' | 'muted'; label: string }
> = {
    restock: { variant: 'green', label: 'Restock' },
    sale: { variant: 'muted', label: 'Sale' },
    adjustment: { variant: 'amber', label: 'Adjustment' },
};

const quantityClass: Record<MovementType, string> = {
    restock: 'text-green-deep',
    sale: 'text-raisin',
    adjustment: 'text-amber-deep',
};

type StockPageProps = {
    products?: Product[];
    movements?: StockMovement[];
};

type RestockLine = {
    product: Product;
    quantity: number;
};

function todayInput(): string {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

function dateToIso(date: string): string {
    if (date.length === 0) {
        return new Date().toISOString();
    }

    return new Date(`${date}T12:00:00`).toISOString();
}

function suggestedQuantity(product: Product): number {
    return Math.max(product.reorder_threshold - product.stock_on_hand, 1);
}

function movementSummary(product: Product): StockMovement['product'] {
    return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
    };
}

function buildMovement(
    product: Product,
    type: MovementType,
    quantity: number,
    note: string | null,
    occurredAt: string,
): StockMovement {
    return {
        id: createMockId(),
        product_id: product.id,
        type,
        quantity,
        occurred_at: occurredAt,
        note,
        sale_id: null,
        product: movementSummary(product),
    };
}

export default function Stock({
    products: initialProducts = activeProducts,
    movements: initialMovements = mockMovements,
}: StockPageProps) {
    const { gentle } = useSprings();
    const { toasts, push, dismiss } = useToasts();
    const [catalog, setCatalog] = useState(initialProducts);
    const [movements, setMovements] = useState(initialMovements);
    const [movementFilter, setMovementFilter] = useState('');
    const [restockOpen, setRestockOpen] = useState(false);
    const [restockPresetId, setRestockPresetId] = useState<string | null>(null);
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [lowStockOpen, setLowStockOpen] = useState(false);

    const lowStock = useMemo(
        () => catalog.filter((product) => product.is_low_stock),
        [catalog],
    );

    const filteredMovements = useMemo(() => {
        if (movementFilter.length === 0) {
            return movements;
        }

        return movements.filter(
            (movement) => movement.product_id === movementFilter,
        );
    }, [movements, movementFilter]);

    function changeStock(productId: string, delta: number) {
        setCatalog((items) =>
            items.map((item) => {
                if (item.id !== productId) {
                    return item;
                }

                const stock_on_hand = item.stock_on_hand + delta;

                return {
                    ...item,
                    stock_on_hand,
                    is_low_stock: stock_on_hand <= item.reorder_threshold,
                    stock_value: item.cost_price * stock_on_hand,
                    updated_at: new Date().toISOString(),
                };
            }),
        );
    }

    function openRestock(presetId: string | null) {
        setRestockPresetId(presetId);
        setRestockOpen(true);
    }

    function submitRestock(lines: RestockLine[], note: string, date: string) {
        if (lines.length === 0) {
            return;
        }

        const noteText = note.trim() || null;
        const occurredAt = dateToIso(date);
        const totalValue = lines.reduce(
            (sum, line) => sum + line.product.cost_price * line.quantity,
            0,
        );

        lines.forEach((line) => {
            changeStock(line.product.id, line.quantity);
            setMovements((current) => [
                buildMovement(
                    line.product,
                    'restock',
                    line.quantity,
                    noteText,
                    occurredAt,
                ),
                ...current,
            ]);
        });

        setRestockOpen(false);
        push(
            `Received ${lines.length} item${lines.length === 1 ? '' : 's'} · ${formatGhs(totalValue)}`,
            'success',
        );
    }

    function submitAdjustment(
        productId: string,
        quantity: number,
        reason: string,
    ) {
        const product = catalog.find((item) => item.id === productId);

        if (product === undefined) {
            return;
        }

        changeStock(product.id, quantity);
        setMovements((current) => [
            buildMovement(
                product,
                'adjustment',
                quantity,
                reason,
                new Date().toISOString(),
            ),
            ...current,
        ]);
        setAdjustOpen(false);
        push(
            `Adjusted ${product.name} by ${formatSignedQuantity(quantity)}`,
            'success',
        );
    }

    return (
        <>
            <Head title="Stock" />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={gentle}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-body text-spanish-gray">
                        Restock the shelves, fix counts, and track every
                        movement.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setLowStockOpen(true)}
                        >
                            <Icon
                                name="warning"
                                className="size-4 text-amber-deep"
                            />
                            Low stock
                            {lowStock.length > 0 && (
                                <Badge variant="amber">
                                    {lowStock.length.toLocaleString('en-GH')}
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant="plain"
                            onClick={() => setAdjustOpen(true)}
                        >
                            Adjust stock
                        </Button>
                        <Button onClick={() => openRestock(null)}>
                            <Icon name="plus" className="size-4" />
                            Receive stock
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow-card">
                    <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-headline text-raisin">
                            Movement history
                        </h2>
                        <select
                            value={movementFilter}
                            onChange={(event) =>
                                setMovementFilter(event.target.value)
                            }
                            aria-label="Filter movements by product"
                            className="rounded-sm border border-line bg-white px-2.5 py-2 text-label text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
                        >
                            <option value="">All products</option>
                            {catalog.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {filteredMovements.length > 0 ? (
                        <DataTable stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <HeaderCell>Product</HeaderCell>
                                    <HeaderCell>Type</HeaderCell>
                                    <HeaderCell align="right">Qty</HeaderCell>
                                    <HeaderCell className="hidden lg:table-cell">When</HeaderCell>
                                    <HeaderCell className="hidden lg:table-cell">Note</HeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMovements.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <Cell className="max-w-48 min-w-0">
                                            <p className="truncate text-title text-raisin">
                                                {movement.product?.name}
                                            </p>
                                            <p className="text-label text-spanish-gray">
                                                {movement.product?.sku}
                                            </p>
                                        </Cell>
                                        <Cell>
                                            <Badge
                                                variant={movementBadge[movement.type].variant}
                                            >
                                                {movementBadge[movement.type].label}
                                            </Badge>
                                        </Cell>
                                        <Cell
                                            align="right"
                                            className={cn(
                                                'font-semibold',
                                                quantityClass[movement.type],
                                            )}
                                        >
                                            {formatSignedQuantity(movement.quantity)}
                                        </Cell>
                                        <Cell className="hidden text-spanish-gray lg:table-cell">
                                            {formatWhen(movement.occurred_at)}
                                        </Cell>
                                        <Cell className="hidden max-w-48 truncate text-spanish-gray lg:table-cell">
                                            {movement.note ?? '—'}
                                        </Cell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </DataTable>
                    ) : (
                        <div className="p-4">
                            <EmptyState
                                icon="stock"
                                title="No movements found"
                                description="Choose a different product, or receive stock above."
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            <LowStockDrawer
                open={lowStockOpen}
                onClose={() => setLowStockOpen(false)}
                products={lowStock}
                onRestock={(productId) => {
                    setLowStockOpen(false);
                    openRestock(productId);
                }}
            />

            <RestockDrawer
                open={restockOpen}
                onClose={() => setRestockOpen(false)}
                catalog={catalog}
                presetId={restockPresetId}
                onSubmit={submitRestock}
                notify={push}
            />

            <AdjustmentDrawer
                open={adjustOpen}
                onClose={() => setAdjustOpen(false)}
                catalog={catalog}
                onSubmit={submitAdjustment}
                notify={push}
            />

            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </>
    );
}

function LowStockDrawer({
    open,
    onClose,
    products,
    onRestock,
}: {
    open: boolean;
    onClose: () => void;
    products: Product[];
    onRestock: (productId: string) => void;
}) {
    return (
        <Drawer open={open} onClose={onClose} title="Low stock">
            <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-display text-amber-deep tabular-nums">
                        {products.length.toLocaleString('en-GH')}
                    </span>
                    <span className="text-label font-medium text-spanish-gray">
                        {products.length === 1 ? 'product' : 'products'} running
                        low
                    </span>
                </div>

                {products.length > 0 ? (
                    <ul className="divide-y divide-line rounded-md border border-line bg-white">
                        {products.map((product) => (
                            <li
                                key={product.id}
                                className="flex items-center gap-3 px-4 py-3"
                            >
                                <StockDot low />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-title text-raisin">
                                        {product.name}
                                    </p>
                                    <p className="text-label text-spanish-gray">
                                        Reorder at {product.reorder_threshold}{' '}
                                        {product.unit}
                                    </p>
                                </div>
                                <span className="text-figure font-semibold text-amber-deep tabular-nums">
                                    {product.stock_on_hand.toLocaleString(
                                        'en-GH',
                                    )}{' '}
                                    left
                                </span>
                                <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={() => onRestock(product.id)}
                                >
                                    <Icon name="plus" className="size-3.5" />
                                    Restock
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-body text-spanish-gray">
                        Nothing running low. Every item is well stocked.
                    </p>
                )}
            </div>
        </Drawer>
    );
}

function RestockDrawer({
    open,
    onClose,
    catalog,
    presetId,
    onSubmit,
    notify,
}: {
    open: boolean;
    onClose: () => void;
    catalog: Product[];
    presetId: string | null;
    onSubmit: (lines: RestockLine[], note: string, date: string) => void;
    notify: (message: string, tone: 'success' | 'warning' | 'danger') => void;
}) {
    const [pickerProductId, setPickerProductId] = useState('');
    const [pickerQuantity, setPickerQuantity] = useState('1');
    const [lines, setLines] = useState<RestockLine[]>(() => {
        if (presetId === null) {
            return [];
        }

        const product = catalog.find((item) => item.id === presetId);

        if (product === undefined) {
            return [];
        }

        return [{ product, quantity: suggestedQuantity(product) }];
    });
    const [note, setNote] = useState('');
    const [date, setDate] = useState(todayInput);

    const totalValue = useMemo(
        () =>
            lines.reduce(
                (sum, line) => sum + line.product.cost_price * line.quantity,
                0,
            ),
        [lines],
    );

    function handleAddLine() {
        const quantity = Number.parseInt(pickerQuantity, 10);

        if (pickerProductId.length === 0) {
            notify('Pick a product to receive', 'warning');

            return;
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            notify('Quantity must be at least 1', 'warning');

            return;
        }

        const product = catalog.find((item) => item.id === pickerProductId);

        if (product === undefined) {
            return;
        }

        setLines((current) => {
            const existing = current.find(
                (line) => line.product.id === product.id,
            );

            if (existing) {
                return current.map((line) =>
                    line.product.id === product.id
                        ? { ...line, quantity: line.quantity + quantity }
                        : line,
                );
            }

            return [...current, { product, quantity }];
        });
        setPickerProductId('');
        setPickerQuantity('1');
    }

    function removeLine(productId: string) {
        setLines((current) =>
            current.filter((line) => line.product.id !== productId),
        );
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title="Receive stock"
            footer={
                <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <span className="text-label tracking-wide text-spanish-gray uppercase">
                            Value
                        </span>
                        <Money
                            pesewas={totalValue}
                            className="text-headline text-raisin"
                        />
                    </div>
                    <Button
                        className="w-full"
                        disabled={lines.length === 0}
                        onClick={() => onSubmit(lines, note, date)}
                    >
                        <Icon name="check" className="size-4" />
                        Receive stock
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <select
                        value={pickerProductId}
                        onChange={(event) =>
                            setPickerProductId(event.target.value)
                        }
                        aria-label="Product to receive"
                        className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
                    >
                        <option value="">Pick a product…</option>
                        {catalog.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            value={pickerQuantity}
                            onChange={(event) =>
                                setPickerQuantity(event.target.value)
                            }
                            aria-label="Quantity to receive"
                            className="flex-1"
                        />
                        <Button variant="plain" onClick={handleAddLine}>
                            <Icon name="plus" className="size-4" />
                            Add line
                        </Button>
                    </div>
                </div>

                {lines.length > 0 ? (
                    <ul className="divide-y divide-line rounded-md border border-line bg-white">
                        {lines.map((line) => (
                            <li
                                key={line.product.id}
                                className="flex items-center gap-3 px-4 py-2.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-title text-raisin">
                                        {line.product.name}
                                    </p>
                                    <p className="text-label text-spanish-gray">
                                        {line.quantity} × {line.product.unit}
                                    </p>
                                </div>
                                <Money
                                    pesewas={
                                        line.product.cost_price * line.quantity
                                    }
                                    className="text-raisin"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLine(line.product.id)}
                                    aria-label={`Remove ${line.product.name} from receive list`}
                                    className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-danger"
                                >
                                    <Icon name="close" className="size-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-body text-spanish-gray">
                        Pick a product and quantity, then add it.
                    </p>
                )}

                <div className="space-y-2">
                    <Input
                        type="text"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Supplier note (optional)"
                        aria-label="Supplier note"
                    />
                    <Input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        aria-label="Received on"
                    />
                </div>
            </div>
        </Drawer>
    );
}

function AdjustmentDrawer({
    open,
    onClose,
    catalog,
    onSubmit,
    notify,
}: {
    open: boolean;
    onClose: () => void;
    catalog: Product[];
    onSubmit: (productId: string, quantity: number, reason: string) => void;
    notify: (message: string, tone: 'success' | 'warning' | 'danger') => void;
}) {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const product = catalog.find((item) => item.id === productId);
        const parsedQuantity = Number.parseInt(quantity, 10);

        if (product === undefined) {
            setError('Pick a product to adjust');

            return;
        }

        if (!Number.isInteger(parsedQuantity) || parsedQuantity === 0) {
            setError('Enter a whole number, and not zero');

            return;
        }

        const reasonText = reason.trim();

        if (reasonText.length === 0) {
            setError('Add a reason for the adjustment');

            return;
        }

        const nextStock = product.stock_on_hand + parsedQuantity;

        if (nextStock < 0) {
            setError(
                `Only ${product.stock_on_hand} ${product.unit} on hand — cannot go below zero`,
            );
            notify('Adjustment would take stock below zero', 'danger');

            return;
        }

        onSubmit(product.id, parsedQuantity, reasonText);
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title="Record adjustment"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="plain" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" form="adjustment-form">
                        Record adjustment
                    </Button>
                </div>
            }
        >
            <form
                id="adjustment-form"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="adjust-product"
                        className="mb-1.5 block text-label font-medium text-raisin"
                    >
                        Product
                    </label>
                    <select
                        id="adjust-product"
                        value={productId}
                        onChange={(event) => {
                            setProductId(event.target.value);
                            setError(null);
                        }}
                        className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
                    >
                        <option value="">Pick a product…</option>
                        {catalog.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="adjust-quantity"
                        className="mb-1.5 block text-label font-medium text-raisin"
                    >
                        Quantity
                    </label>
                    <Input
                        id="adjust-quantity"
                        type="number"
                        inputMode="numeric"
                        step={1}
                        value={quantity}
                        onChange={(event) => {
                            setQuantity(event.target.value);
                            setError(null);
                        }}
                        placeholder="e.g. -2"
                    />
                    <p className="mt-1.5 text-label text-spanish-gray">
                        Use a minus for stock out (breakage, count errors).
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="adjust-reason"
                        className="mb-1.5 block text-label font-medium text-raisin"
                    >
                        Reason
                    </label>
                    <Input
                        id="adjust-reason"
                        type="text"
                        value={reason}
                        onChange={(event) => {
                            setReason(event.target.value);
                            setError(null);
                        }}
                        placeholder="e.g. Shelf damage"
                    />
                </div>

                {error && <p className="text-label text-danger">{error}</p>}
            </form>
        </Drawer>
    );
}
