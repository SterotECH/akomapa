import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
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
import { activeProducts, mockSales as initialSales } from '@/lib/mock-data';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Product, Sale } from '@/types';

type ReportTab = 'stock-levels' | 'low-stock' | 'sales';

type ReportsPageProps = {
    products?: Product[];
    sales?: Sale[];
};

const reportTabs: { id: ReportTab; label: string }[] = [
    { id: 'stock-levels', label: 'Stock levels' },
    { id: 'low-stock', label: 'Low stock' },
    { id: 'sales', label: 'Sales' },
];

function isoDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

function formatReportDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function Reports({
    products = activeProducts,
    sales = initialSales,
}: ReportsPageProps) {
    const { gentle } = useSprings();
    const [activeTab, setActiveTab] = useState<ReportTab>('stock-levels');
    const [from, setFrom] = useState(isoDate(6));
    const [to, setTo] = useState(isoDate(0));

    const lowStock = useMemo(
        () => products.filter((product) => product.is_low_stock),
        [products],
    );

    const salesInRange = useMemo(() => {
        const fromMs = new Date(`${from}T00:00:00`).getTime();
        const toMs = new Date(`${to}T23:59:59.999`).getTime();

        return sales.filter((sale) => {
            const soldAt = new Date(sale.sold_at).getTime();

            return soldAt >= fromMs && soldAt <= toMs;
        });
    }, [sales, from, to]);

    const rangeSummary = useMemo(
        () => ({
            sales: salesInRange.length,
            items: salesInRange.reduce(
                (sum, sale) => sum + sale.items_count,
                0,
            ),
            total: salesInRange.reduce((sum, sale) => sum + sale.total, 0),
        }),
        [salesInRange],
    );

    const reportTitle =
        activeTab === 'sales'
            ? `Sales report · ${from} to ${to}`
            : activeTab === 'low-stock'
              ? 'Low stock report'
              : 'Current stock levels';

    return (
        <>
            <Head title="Reports" />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={gentle}
            >
                <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-body text-spanish-gray">
                        Stock levels, low stock, and sales — printable for the
                        record.
                    </p>
                    <Button variant="plain" onClick={() => window.print()}>
                        <Icon name="print" className="size-4" />
                        Print
                    </Button>
                </div>

                <div className="no-print flex flex-wrap gap-1 rounded-md bg-white p-1 shadow-card">
                    {reportTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 rounded-md px-4 py-2.5 text-title font-semibold whitespace-nowrap transition-colors duration-fast min-h-11 sm:min-w-36 sm:flex-none',
                                activeTab === tab.id
                                    ? 'bg-amber text-amber-ink'
                                    : 'text-spanish-gray hover:bg-raisin/5 hover:text-raisin',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="print-area">
                    <div className="report-header">
                        <p className="wordmark text-wordmark">
                            Akomapa Neat Enterprise
                        </p>
                        <p className="text-body">
                            Ablekuma 10 Plot, GC-104-444 · {reportTitle}
                        </p>
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={gentle}
                    >
                        {activeTab === 'stock-levels' && (
                            <StockLevelsReport products={products} />
                        )}
                        {activeTab === 'low-stock' && (
                            <LowStockReport products={lowStock} />
                        )}
                        {activeTab === 'sales' && (
                            <SalesReport
                                sales={salesInRange}
                                summary={rangeSummary}
                                from={from}
                                to={to}
                                onFrom={setFrom}
                                onTo={setTo}
                            />
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}

function StockLevelsReport({ products }: { products: Product[] }) {
    const sorted = useMemo(
        () =>
            [...products].sort(
                (a, b) =>
                    (a.category?.name ?? '').localeCompare(
                        b.category?.name ?? '',
                    ) || a.name.localeCompare(b.name),
            ),
        [products],
    );

    const totalValue = sorted.reduce(
        (sum, product) => sum + product.stock_value,
        0,
    );

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <h2 className="text-headline text-raisin">Stock levels</h2>
                <span className="text-label text-spanish-gray">
                    {sorted.length.toLocaleString('en-GH')} products
                </span>
            </div>

            <DataTable stickyHeader>
                <TableHead>
                    <TableRow>
                        <HeaderCell>SKU</HeaderCell>
                        <HeaderCell>Product</HeaderCell>
                        <HeaderCell className="hidden md:table-cell">Category</HeaderCell>
                        <HeaderCell className="hidden md:table-cell">Unit</HeaderCell>
                        <HeaderCell align="right">On hand</HeaderCell>
                        <HeaderCell align="right" className="hidden lg:table-cell">Reorder at</HeaderCell>
                        <HeaderCell align="right">Value</HeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sorted.map((product) => (
                        <TableRow key={product.id}>
                            <Cell className="text-spanish-gray">
                                {product.sku}
                            </Cell>
                            <Cell>
                                <p className="truncate text-title text-raisin">
                                    {product.name}
                                </p>
                            </Cell>
                            <Cell className="hidden text-spanish-gray md:table-cell">
                                {product.category?.name ?? '—'}
                            </Cell>
                            <Cell className="hidden text-spanish-gray md:table-cell">
                                {product.unit}
                            </Cell>
                            <Cell align="right">
                                {product.stock_on_hand.toLocaleString('en-GH')}
                            </Cell>
                            <Cell align="right" className="hidden lg:table-cell">
                                {product.reorder_threshold.toLocaleString('en-GH')}
                            </Cell>
                            <Cell align="right">
                                <Money pesewas={product.stock_value} />
                            </Cell>
                        </TableRow>
                    ))}
                </TableBody>
            </DataTable>

            <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <span className="text-label tracking-wide text-spanish-gray uppercase">
                    Total stock value
                </span>
                <Money pesewas={totalValue} className="text-title" />
            </div>
        </div>
    );
}

function LowStockReport({ products }: { products: Product[] }) {
    const totalValue = products.reduce(
        (sum, product) => sum + product.stock_value,
        0,
    );

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <h2 className="text-headline text-raisin">Low stock</h2>
                <Badge variant="amber">
                    {products.length.toLocaleString('en-GH')} items
                </Badge>
            </div>

            {products.length > 0 ? (
                <>
                    <DataTable stickyHeader>
                        <TableHead>
                            <TableRow>
                                <HeaderCell>SKU</HeaderCell>
                                <HeaderCell>Product</HeaderCell>
                                <HeaderCell className="hidden md:table-cell">Unit</HeaderCell>
                                <HeaderCell align="right">On hand</HeaderCell>
                                <HeaderCell align="right" className="hidden lg:table-cell">Reorder at</HeaderCell>
                                <HeaderCell align="right">Value</HeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <Cell className="text-spanish-gray">
                                        {product.sku}
                                    </Cell>
                                    <Cell>
                                        <p className="flex items-center gap-2 truncate text-title text-raisin">
                                            <StockDot low />
                                            {product.name}
                                        </p>
                                    </Cell>
                                    <Cell className="hidden text-spanish-gray md:table-cell">
                                        {product.unit}
                                    </Cell>
                                    <Cell
                                        align="right"
                                        className="font-semibold text-amber-deep"
                                    >
                                        {product.stock_on_hand.toLocaleString('en-GH')}
                                    </Cell>
                                    <Cell align="right" className="hidden lg:table-cell">
                                        {product.reorder_threshold.toLocaleString('en-GH')}
                                    </Cell>
                                    <Cell align="right">
                                        <Money pesewas={product.stock_value} />
                                    </Cell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </DataTable>

                    <div className="flex items-center justify-between border-t border-line px-5 py-3">
                        <span className="text-label tracking-wide text-spanish-gray uppercase">
                            At or below reorder threshold
                        </span>
                        <Money pesewas={totalValue} className="text-title" />
                    </div>
                </>
            ) : (
                <div className="p-4">
                    <EmptyState
                        icon="check"
                        title="Nothing running low"
                        description="Every product is above its reorder threshold."
                    />
                </div>
            )}
        </div>
    );
}

function SalesReport({
    sales,
    summary,
    from,
    to,
    onFrom,
    onTo,
}: {
    sales: Sale[];
    summary: { sales: number; items: number; total: number };
    from: string;
    to: string;
    onFrom: (value: string) => void;
    onTo: (value: string) => void;
}) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-headline text-raisin">Sales</h2>
                <div className="no-print flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="block">
                        <span className="mb-1 block text-label font-medium text-spanish-gray">
                            From
                        </span>
                        <Input
                            type="date"
                            value={from}
                            onChange={(event) => onFrom(event.target.value)}
                            aria-label="Sales report from date"
                            className="w-auto"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-label font-medium text-spanish-gray">
                            To
                        </span>
                        <Input
                            type="date"
                            value={to}
                            onChange={(event) => onTo(event.target.value)}
                            aria-label="Sales report to date"
                            className="w-auto"
                        />
                    </label>
                </div>
            </div>

            {sales.length > 0 ? (
                <>
                    <DataTable stickyHeader>
                        <TableHead>
                            <TableRow>
                                <HeaderCell>Sale</HeaderCell>
                                <HeaderCell>Date</HeaderCell>
                                <HeaderCell align="right">Items</HeaderCell>
                                <HeaderCell align="right">Total</HeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <Cell className="text-raisin">
                                        {sale.sale_number}
                                    </Cell>
                                    <Cell className="text-spanish-gray">
                                        {formatReportDate(sale.sold_at)}
                                    </Cell>
                                    <Cell align="right">
                                        {sale.items_count.toLocaleString('en-GH')}
                                    </Cell>
                                    <Cell align="right">
                                        <Money pesewas={sale.total} />
                                    </Cell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </DataTable>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
                        <p className="text-label text-spanish-gray">
                            {summary.sales.toLocaleString('en-GH')} sales ·{' '}
                            {summary.items.toLocaleString('en-GH')} items
                        </p>
                        <Money pesewas={summary.total} className="text-title" />
                    </div>
                </>
            ) : (
                <div className="p-4">
                    <EmptyState
                        icon="reports"
                        title="No sales in this range"
                        description="Pick a wider from–to window, or ring up sales at the POS."
                    />
                </div>
            )}
        </div>
    );
}
