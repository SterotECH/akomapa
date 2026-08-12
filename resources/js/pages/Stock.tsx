import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/Input';
import { Money } from '@/components/Money';
import { StockDot } from '@/components/StockDot';
import {
    Cell,
    HeaderCell,
    Table,
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

function movementSummary(product: Product): StockMovement['product'] {
    return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
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
    const [pickerProductId, setPickerProductId] = useState('');
    const [pickerQuantity, setPickerQuantity] = useState('1');
    const [lines, setLines] = useState<RestockLine[]>([]);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(todayInput);
    const [adjustProductId, setAdjustProductId] = useState('');
    const [adjustQuantity, setAdjustQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [adjustError, setAdjustError] = useState<string | null>(null);
    const [movementFilter, setMovementFilter] = useState('');

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

    const totalValue = useMemo(
        () =>
            lines.reduce(
                (sum, line) => sum + line.product.cost_price * line.quantity,
                0,
            ),
        [lines],
    );

    function suggestedQuantity(product: Product): number {
        return Math.max(product.reorder_threshold - product.stock_on_hand, 1);
    }

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

    function handleAddLine() {
        const quantity = Number.parseInt(pickerQuantity, 10);

        if (pickerProductId.length === 0) {
            push('Pick a product to receive', 'warning');

            return;
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            push('Quantity must be at least 1', 'warning');

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

    function shortcutRestock(product: Product) {
        if (lines.some((line) => line.product.id === product.id)) {
            push(`${product.name} is already on the receive list`, 'warning');

            return;
        }

        setLines((current) => [
            ...current,
            { product, quantity: suggestedQuantity(product) },
        ]);
        push(`Added ${product.name} to receive`, 'success');
    }

    function submitRestock() {
        if (lines.length === 0) {
            return;
        }

        const noteText = note.trim() || null;
        const occurredAt = dateToIso(date);

        lines.forEach((line) => {
            changeStock(line.product.id, line.quantity);
            setMovements((current) => [
                {
                    id: createMockId(),
                    product_id: line.product.id,
                    type: 'restock',
                    quantity: line.quantity,
                    occurred_at: occurredAt,
                    note: noteText,
                    sale_id: null,
                    product: movementSummary(line.product),
                },
                ...current,
            ]);
        });

        setLines([]);
        setNote('');
        push(
            `Received ${lines.length} item${lines.length === 1 ? '' : 's'} · ${formatGhs(totalValue)}`,
            'success',
        );
    }

    function submitAdjustment(event: FormEvent) {
        event.preventDefault();

        const product = catalog.find((item) => item.id === adjustProductId);
        const quantity = Number.parseInt(adjustQuantity, 10);

        if (product === undefined) {
            setAdjustError('Pick a product to adjust');

            return;
        }

        if (!Number.isInteger(quantity) || quantity === 0) {
            setAdjustError('Enter a whole number, and not zero');

            return;
        }

        const reasonText = reason.trim();

        if (reasonText.length === 0) {
            setAdjustError('Add a reason for the adjustment');

            return;
        }

        const nextStock = product.stock_on_hand + quantity;

        if (nextStock < 0) {
            setAdjustError(
                `Only ${product.stock_on_hand} ${product.unit} on hand — cannot go below zero`,
            );
            push('Adjustment would take stock below zero', 'danger');

            return;
        }

        changeStock(product.id, quantity);
        setMovements((current) => [
            {
                id: createMockId(),
                product_id: product.id,
                type: 'adjustment',
                quantity,
                occurred_at: new Date().toISOString(),
                note: reasonText,
                sale_id: null,
                product: movementSummary(product),
            },
            ...current,
        ]);
        setAdjustProductId('');
        setAdjustQuantity('');
        setReason('');
        setAdjustError(null);
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
                <Card>
                    <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                        <h2 className="text-headline text-raisin">Low stock</h2>
                        <Badge variant="amber">
                            {lowStock.length.toLocaleString('en-GH')}
                        </Badge>
                    </div>

                    {lowStock.length > 0 ? (
                        <ul className="divide-y divide-line">
                            {lowStock.map((product) => (
                                <li
                                    key={product.id}
                                    className="flex items-center gap-3 px-5 py-3"
                                >
                                    <StockDot low />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-title text-raisin">
                                            {product.name}
                                        </p>
                                        <p className="text-label text-spanish-gray">
                                            Reorder at{' '}
                                            {product.reorder_threshold}{' '}
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
                                        onClick={() => shortcutRestock(product)}
                                    >
                                        <Icon
                                            name="plus"
                                            className="size-3.5"
                                        />
                                        Restock
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-5 py-10 text-center">
                            <p className="text-body text-spanish-gray">
                                Nothing running low. Every item is well stocked.
                            </p>
                        </div>
                    )}
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <div className="border-b border-line px-5 py-4">
                            <h2 className="text-headline text-raisin">
                                Receive stock
                            </h2>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <select
                                    value={pickerProductId}
                                    onChange={(event) =>
                                        setPickerProductId(event.target.value)
                                    }
                                    aria-label="Product to receive"
                                    className="w-full flex-1 rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
                                >
                                    <option value="">Pick a product…</option>
                                    {catalog.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name} ({product.sku})
                                        </option>
                                    ))}
                                </select>
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
                                    className="sm:w-24"
                                />
                                <Button variant="plain" onClick={handleAddLine}>
                                    <Icon name="plus" className="size-4" />
                                    Add line
                                </Button>
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
                                                    {line.quantity} ×{' '}
                                                    {line.product.unit}
                                                </p>
                                            </div>
                                            <Money
                                                pesewas={
                                                    line.product.cost_price *
                                                    line.quantity
                                                }
                                                className="text-raisin"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeLine(line.product.id)
                                                }
                                                aria-label={`Remove ${line.product.name} from receive list`}
                                                className="rounded-md p-1 text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-danger"
                                            >
                                                <Icon
                                                    name="close"
                                                    className="size-4"
                                                />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-body text-spanish-gray">
                                    Pick a product and quantity, then add it.
                                </p>
                            )}

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    type="text"
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    placeholder="Supplier note (optional)"
                                    aria-label="Supplier note"
                                    className="flex-1"
                                />
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(event) =>
                                        setDate(event.target.value)
                                    }
                                    aria-label="Received on"
                                    className="sm:w-44"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-label tracking-wide text-spanish-gray uppercase">
                                        Value
                                    </span>
                                    <Money
                                        pesewas={totalValue}
                                        className="text-headline text-raisin"
                                    />
                                </div>
                                <Button
                                    disabled={lines.length === 0}
                                    onClick={submitRestock}
                                >
                                    <Icon name="check" className="size-4" />
                                    Receive stock
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="border-b border-line px-5 py-4">
                            <h2 className="text-headline text-raisin">
                                Record adjustment
                            </h2>
                        </div>

                        <form
                            onSubmit={submitAdjustment}
                            className="space-y-4 p-5"
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
                                    value={adjustProductId}
                                    onChange={(event) => {
                                        setAdjustProductId(event.target.value);
                                        setAdjustError(null);
                                    }}
                                    className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
                                >
                                    <option value="">Pick a product…</option>
                                    {catalog.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
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
                                    value={adjustQuantity}
                                    onChange={(event) => {
                                        setAdjustQuantity(event.target.value);
                                        setAdjustError(null);
                                    }}
                                    placeholder="e.g. -2"
                                />
                                <p className="mt-1.5 text-label text-spanish-gray">
                                    Use a minus for stock out (breakage, count
                                    errors).
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
                                        setAdjustError(null);
                                    }}
                                    placeholder="e.g. Shelf damage"
                                />
                            </div>

                            {adjustError && (
                                <p className="text-label text-danger">
                                    {adjustError}
                                </p>
                            )}

                            <Button
                                variant="plain"
                                type="submit"
                                className="w-full"
                            >
                                Record adjustment
                            </Button>
                        </form>
                    </Card>
                </div>

                <Card>
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
                            className="rounded-sm border border-line bg-white px-2.5 py-1.5 text-label text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
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
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <HeaderCell>Product</HeaderCell>
                                        <HeaderCell>Type</HeaderCell>
                                        <HeaderCell align="right">
                                            Qty
                                        </HeaderCell>
                                        <HeaderCell>When</HeaderCell>
                                        <HeaderCell>Note</HeaderCell>
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
                                                    variant={
                                                        movementBadge[
                                                            movement.type
                                                        ].variant
                                                    }
                                                >
                                                    {
                                                        movementBadge[
                                                            movement.type
                                                        ].label
                                                    }
                                                </Badge>
                                            </Cell>
                                            <Cell
                                                align="right"
                                                className={cn(
                                                    'font-semibold',
                                                    quantityClass[
                                                        movement.type
                                                    ],
                                                )}
                                            >
                                                {formatSignedQuantity(
                                                    movement.quantity,
                                                )}
                                            </Cell>
                                            <Cell className="text-spanish-gray">
                                                {formatWhen(
                                                    movement.occurred_at,
                                                )}
                                            </Cell>
                                            <Cell className="max-w-48 truncate text-spanish-gray">
                                                {movement.note ?? '—'}
                                            </Cell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-4">
                            <EmptyState
                                icon="stock"
                                title="No movements found"
                                description="Choose a different product, or receive stock above."
                            />
                        </div>
                    )}
                </Card>
            </motion.div>

            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
