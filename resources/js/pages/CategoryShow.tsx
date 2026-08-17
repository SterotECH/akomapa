import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
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
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { index as categoriesIndex } from '@/routes/categories';
import { show as productsShow } from '@/routes/products';
import type { Category, Product } from '@/types';

type CategoryShowProps = {
    category: Category & { products_count: number };
    products: Product[];
};

export default function CategoryShow({
    category,
    products,
}: CategoryShowProps) {
    const { gentle } = useSprings();

    const totalValue = products.reduce(
        (sum, product) => sum + product.stock_value,
        0,
    );
    const totalStock = products.reduce(
        (sum, product) => sum + product.stock_on_hand,
        0,
    );
    const lowStockCount = products.filter((p) => p.is_low_stock).length;

    return (
        <>
            <Head title={category.name} />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={gentle}
            >
                <div className="flex items-center gap-3">
                    <Link
                        href={categoriesIndex.url()}
                        className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
                    >
                        <Icon name="arrow-left" className="size-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-display text-raisin">
                            {category.name}
                        </h1>
                        <p className="text-label text-spanish-gray">
                            {category.products_count} product
                            {category.products_count === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Products
                        </p>
                        <p className="mt-1 text-headline text-raisin">
                            {category.products_count}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Total stock
                        </p>
                        <p className="mt-1 text-headline text-raisin">
                            {totalStock.toLocaleString('en-GH')}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-label tracking-wide text-spanish-gray uppercase">
                            Stock value
                        </p>
                        <Money
                            pesewas={totalValue}
                            className="mt-1 text-headline text-raisin"
                        />
                    </Card>
                </div>

                {lowStockCount > 0 && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                        <span className="text-label text-amber-700">
                            {lowStockCount} product
                            {lowStockCount === 1 ? ' is' : 's are'} running
                            low
                        </span>
                    </div>
                )}

                <div className="overflow-hidden rounded-lg bg-white shadow-card">
                    <div className="border-b border-line px-5 py-4">
                        <h2 className="text-headline text-raisin">
                            Products in {category.name}
                        </h2>
                    </div>

                    {products.length > 0 ? (
                        <DataTable
                            stickyHeader
                            columns={[35, 15, 12, 12, 12, 14]}
                        >
                            <TableHead>
                                <TableRow>
                                    <HeaderCell>Product</HeaderCell>
                                    <HeaderCell align="right">
                                        Selling
                                    </HeaderCell>
                                    <HeaderCell align="right">Stock</HeaderCell>
                                    <HeaderCell align="right">
                                        Value
                                    </HeaderCell>
                                    <HeaderCell>Status</HeaderCell>
                                    <HeaderCell align="right">
                                        Actions
                                    </HeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <Cell className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <StockDot
                                                    low={product.is_low_stock}
                                                />
                                                <div className="min-w-0">
                                                    <p
                                                        className={cn(
                                                            'truncate text-title',
                                                            product.is_active
                                                                ? 'text-raisin'
                                                                : 'text-spanish-gray',
                                                        )}
                                                    >
                                                        {product.name}
                                                    </p>
                                                    <p className="text-label text-spanish-gray">
                                                        {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </Cell>
                                        <Cell align="right">
                                            <Money
                                                pesewas={
                                                    product.selling_price
                                                }
                                                className="text-raisin"
                                            />
                                        </Cell>
                                        <Cell
                                            align="right"
                                            className={cn(
                                                'font-semibold',
                                                product.is_low_stock
                                                    ? 'text-amber-deep'
                                                    : 'text-raisin',
                                            )}
                                        >
                                            {product.stock_on_hand.toLocaleString(
                                                'en-GH',
                                            )}{' '}
                                            {product.unit}
                                        </Cell>
                                        <Cell align="right">
                                            <Money
                                                pesewas={product.stock_value}
                                                className="text-spanish-gray"
                                            />
                                        </Cell>
                                        <Cell>
                                            {product.is_active ? (
                                                <Badge variant="green">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="muted">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </Cell>
                                        <Cell align="right">
                                            <Link
                                                href={productsShow.url(
                                                    product.id,
                                                )}
                                                className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
                                                title="View product"
                                            >
                                                <Icon name="eye" className="size-4" />
                                            </Link>
                                        </Cell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </DataTable>
                    ) : (
                        <div className="p-4">
                            <EmptyState
                                icon="products"
                                title="No products in this category"
                                description="Assign products to this category from the Products page."
                            />
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
