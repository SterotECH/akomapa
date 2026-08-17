import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
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
import { formatGhs, formatSignedQuantity, formatWhen } from '@/lib/format';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { index as productsIndex } from '@/routes/products';
import type { Category, StockMovement } from '@/types';

type ProductShowProps = {
    product: {
        id: string;
        sku: string;
        name: string;
        barcode: string | null;
        unit: string;
        cost_price: number;
        selling_price: number;
        reorder_threshold: number;
        is_active: boolean;
        stock_on_hand: number;
        is_low_stock: boolean;
        stock_value: number;
        category: Category | null;
        created_at: string | null;
        updated_at: string | null;
    };
    movements: StockMovement[];
};

const movementBadge: Record<
    string,
    { variant: 'amber' | 'green' | 'muted'; label: string }
> = {
    restock: { variant: 'green', label: 'Restock' },
    sale: { variant: 'muted', label: 'Sale' },
    adjustment: { variant: 'amber', label: 'Adjustment' },
};

const quantityClass: Record<string, string> = {
    restock: 'text-green-deep',
    sale: 'text-raisin',
    adjustment: 'text-amber-deep',
};

export default function ProductShow({ product, movements }: ProductShowProps) {
    const { gentle } = useSprings();

    const margin =
        product.selling_price > 0
            ? (
                  ((product.selling_price - product.cost_price) /
                      product.selling_price) *
                  100
              ).toFixed(1)
            : '0.0';

    return (
        <>
            <Head title={product.name} />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={gentle}
            >
                <div className="flex items-center gap-3">
                    <Link
                        href={productsIndex.url()}
                        className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
                    >
                        <Icon name="arrow-left" className="size-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-display text-raisin">
                            {product.name}
                        </h1>
                        <p className="text-label text-spanish-gray">
                            {product.sku}
                            {product.barcode && ` · ${product.barcode}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StockDot low={product.is_low_stock} />
                        {product.is_low_stock && (
                            <Badge variant="amber">Low stock</Badge>
                        )}
                        {!product.is_active && (
                            <Badge variant="muted">Inactive</Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Selling price
                        </p>
                        <Money
                            pesewas={product.selling_price}
                            className="mt-1 text-headline text-raisin"
                        />
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Cost price
                        </p>
                        <Money
                            pesewas={product.cost_price}
                            className="mt-1 text-headline text-raisin"
                        />
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Stock on hand
                        </p>
                        <p className="mt-1 text-headline text-raisin">
                            {product.stock_on_hand.toLocaleString('en-GH')}{' '}
                            <span className="text-label text-spanish-gray">
                                {product.unit}
                            </span>
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Stock value
                        </p>
                        <Money
                            pesewas={product.stock_value}
                            className="mt-1 text-headline text-raisin"
                        />
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Category
                        </p>
                        <p className="mt-1 text-body text-raisin">
                            {product.category?.name ?? '—'}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Margin
                        </p>
                        <p className="mt-1 text-body text-raisin">
                            {margin}%
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Reorder at
                        </p>
                        <p className="mt-1 text-body text-raisin">
                            {product.reorder_threshold} {product.unit}
                        </p>
                    </Card>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow-card">
                    <div className="border-b border-line px-5 py-4">
                        <h2 className="text-headline text-raisin">
                            Recent movements
                        </h2>
                    </div>

                    {movements.length > 0 ? (
                        <DataTable stickyHeader columns={[40, 22, 10, 14, 14]}>
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
                                {movements.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <Cell className="min-w-0">
                                            <p className="truncate text-title text-raisin">
                                                {movement.product?.name ?? '—'}
                                            </p>
                                            <p className="text-label text-spanish-gray">
                                                {movement.product?.sku}
                                            </p>
                                        </Cell>
                                        <Cell>
                                            <Badge
                                                variant={
                                                    movementBadge[movement.type]
                                                        .variant
                                                }
                                            >
                                                {
                                                    movementBadge[movement.type]
                                                        .label
                                                }
                                            </Badge>
                                        </Cell>
                                        <Cell
                                            align="right"
                                            className={cn(
                                                'font-semibold',
                                                quantityClass[movement.type],
                                            )}
                                        >
                                            {formatSignedQuantity(
                                                movement.quantity,
                                            )}
                                        </Cell>
                                        <Cell className="text-spanish-gray">
                                            {formatWhen(movement.occurred_at)}
                                        </Cell>
                                        <Cell className="truncate text-spanish-gray">
                                            {movement.note ?? '—'}
                                        </Cell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </DataTable>
                    ) : (
                        <div className="p-4">
                            <p className="text-body text-spanish-gray">
                                No movements recorded yet.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
