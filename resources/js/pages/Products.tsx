import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Drawer } from '@/components/Drawer';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { Input, SearchField } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Money } from '@/components/Money';
import {
    Cell,
    HeaderCell,
    Table,
    TableBody,
    TableHead,
    TableRow,
} from '@/components/Table';
import { ToastStack, useToasts } from '@/components/Toast';
import {
    categories as mockCategories,
    products as mockProducts,
} from '@/lib/mock-data';
import { createMockId } from '@/lib/mock-id';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types';

type ProductsPageProps = {
    products?: Product[];
    categories?: Category[];
};

type DrawerState =
    { open: false; product: null } | { open: true; product: Product | null };

type ProductForm = {
    name: string;
    sku: string;
    barcode: string;
    categoryId: string;
    unit: string;
    cost: string;
    selling: string;
    threshold: string;
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

type ProductPayload = {
    name: string;
    sku: string;
    barcode: string | null;
    categoryId: string | null;
    unit: string;
    cost_price: number;
    selling_price: number;
    reorder_threshold: number;
};

const emptyForm: ProductForm = {
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    unit: '',
    cost: '',
    selling: '',
    threshold: '',
};

function toForm(product: Product): ProductForm {
    return {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? '',
        categoryId: product.category?.id ?? '',
        unit: product.unit,
        cost: (product.cost_price / 100).toFixed(2),
        selling: (product.selling_price / 100).toFixed(2),
        threshold: String(product.reorder_threshold),
    };
}

function parsePesewas(value: string): number | null {
    const parsed = Number.parseFloat(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return null;
    }

    return Math.round(parsed * 100);
}

function validateForm(
    draft: ProductForm,
    catalog: Product[],
    editingId: string | null,
): FormErrors {
    const errors: FormErrors = {};

    const name = draft.name.trim();
    const sku = draft.sku.trim().toLowerCase();
    const barcode = draft.barcode.trim().toLowerCase();
    const unit = draft.unit.trim();

    if (name.length === 0) {
        errors.name = 'Enter a product name';
    }

    if (sku.length === 0) {
        errors.sku = 'Enter a SKU or code';
    } else if (
        catalog.some(
            (product) =>
                product.sku.trim().toLowerCase() === sku &&
                product.id !== editingId,
        )
    ) {
        errors.sku = 'SKU already in use — pick a unique code';
    }

    if (
        barcode.length > 0 &&
        catalog.some(
            (product) =>
                product.barcode?.toLowerCase() === barcode &&
                product.id !== editingId,
        )
    ) {
        errors.barcode = 'Barcode already in use';
    }

    if (unit.length === 0) {
        errors.unit = 'Enter a unit (e.g. tin, sachet)';
    }

    if (draft.cost.trim().length === 0) {
        errors.cost = 'Enter a cost price';
    } else if (parsePesewas(draft.cost) === null) {
        errors.cost = 'Enter an amount ≥ 0';
    }

    if (draft.selling.trim().length === 0) {
        errors.selling = 'Enter a selling price';
    } else if (parsePesewas(draft.selling) === null) {
        errors.selling = 'Enter an amount ≥ 0';
    }

    const threshold = Number.parseFloat(draft.threshold);

    if (draft.threshold.trim().length === 0) {
        errors.threshold = 'Enter a reorder point';
    } else if (!Number.isInteger(threshold) || threshold < 0) {
        errors.threshold = 'Enter a whole number ≥ 0';
    }

    return errors;
}

export default function Products({
    products: initialProducts = mockProducts,
    categories = mockCategories,
}: ProductsPageProps) {
    const { gentle } = useSprings();
    const { toasts, push, dismiss } = useToasts();
    const [catalog, setCatalog] = useState(initialProducts);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [drawer, setDrawer] = useState<DrawerState>({
        open: false,
        product: null,
    });
    const [pendingDeactivate, setPendingDeactivate] = useState<Product | null>(
        null,
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return catalog.filter((product) => {
            const matchesCategory =
                categoryId === null || product.category?.id === categoryId;
            const matchesSearch =
                term.length === 0 ||
                product.name.toLowerCase().includes(term) ||
                product.sku.toLowerCase().includes(term) ||
                (product.barcode?.toLowerCase().includes(term) ?? false);

            return matchesCategory && matchesSearch;
        });
    }, [catalog, search, categoryId]);

    const activeCount = useMemo(
        () => catalog.filter((product) => product.is_active).length,
        [catalog],
    );

    function openCreate() {
        setDrawer({ open: true, product: null });
    }

    function openEdit(product: Product) {
        setDrawer({ open: true, product });
    }

    function closeDrawer() {
        setDrawer({ open: false, product: null });
    }

    function saveProduct(payload: ProductPayload) {
        const category = payload.categoryId
            ? (categories.find((item) => item.id === payload.categoryId) ??
              null)
            : null;

        if (drawer.product) {
            const id = drawer.product.id;

            setCatalog((items) =>
                items.map((item) => {
                    if (item.id !== id) {
                        return item;
                    }

                    return {
                        ...item,
                        ...payload,
                        category,
                        is_low_stock:
                            item.stock_on_hand <= payload.reorder_threshold,
                        stock_value: payload.cost_price * item.stock_on_hand,
                        updated_at: new Date().toISOString(),
                    };
                }),
            );

            push(`Saved ${payload.name}`, 'success');
        } else {
            const product: Product = {
                id: createMockId(),
                ...payload,
                category,
                is_active: true,
                stock_on_hand: 0,
                is_low_stock: true,
                stock_value: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setCatalog((items) => [...items, product]);
            push(`Added ${payload.name}`, 'success');
        }

        closeDrawer();
    }

    function confirmDeactivate() {
        if (pendingDeactivate === null) {
            return;
        }

        const product = pendingDeactivate;

        setCatalog((items) =>
            items.map((item) =>
                item.id === product.id
                    ? {
                          ...item,
                          is_active: false,
                          updated_at: new Date().toISOString(),
                      }
                    : item,
            ),
        );
        setPendingDeactivate(null);
        push(`Deactivated ${product.name} — hidden from POS`, 'success');
    }

    function reactivate(product: Product) {
        setCatalog((items) =>
            items.map((item) =>
                item.id === product.id
                    ? {
                          ...item,
                          is_active: true,
                          updated_at: new Date().toISOString(),
                      }
                    : item,
            ),
        );

        push(`Reactivated ${product.name}`, 'success');
    }

    return (
        <>
            <Head title="Products" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchField
                        className="w-full sm:max-w-sm"
                        placeholder="Search by name, SKU, or barcode…"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search products"
                    />
                    <Button onClick={openCreate}>
                        <Icon name="plus" className="size-4" />
                        Add product
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-2 overflow-x-auto pb-0.5">
                        <button
                            type="button"
                            onClick={() => setCategoryId(null)}
                            className={cn(
                                'shrink-0 rounded-full border px-3 py-1.5 text-label font-semibold transition-colors duration-fast',
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
                                        'shrink-0 rounded-full border px-3 py-1.5 text-label font-semibold transition-colors duration-fast',
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

                    <p className="hidden shrink-0 text-label text-spanish-gray lg:block">
                        {filtered.length} of {catalog.length} products ·{' '}
                        {activeCount} active
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={gentle}
                >
                    <Card className="overflow-hidden">
                        {filtered.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <HeaderCell>Product</HeaderCell>
                                            <HeaderCell>Category</HeaderCell>
                                            <HeaderCell align="right">
                                                Cost
                                            </HeaderCell>
                                            <HeaderCell align="right">
                                                Selling
                                            </HeaderCell>
                                            <HeaderCell align="right">
                                                Stock
                                            </HeaderCell>
                                            <HeaderCell>Status</HeaderCell>
                                            <HeaderCell align="right">
                                                Actions
                                            </HeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filtered.map((product) => (
                                            <TableRow key={product.id}>
                                                <Cell className="max-w-56 min-w-0">
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
                                                    <p className="truncate text-label text-spanish-gray">
                                                        {product.sku}
                                                        {product.barcode
                                                            ? ` · ${product.barcode}`
                                                            : ''}
                                                    </p>
                                                </Cell>
                                                <Cell className="text-spanish-gray">
                                                    {product.category?.name ??
                                                        '—'}
                                                </Cell>
                                                <Cell align="right">
                                                    <Money
                                                        pesewas={
                                                            product.cost_price
                                                        }
                                                        className="text-spanish-gray"
                                                    />
                                                </Cell>
                                                <Cell align="right">
                                                    <Money
                                                        pesewas={
                                                            product.selling_price
                                                        }
                                                        className="text-raisin"
                                                    />
                                                </Cell>
                                                <Cell align="right">
                                                    <span
                                                        className={cn(
                                                            'flex items-center justify-end gap-2',
                                                        )}
                                                    >
                                                        <span
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
                                                        </span>
                                                        {product.is_low_stock && (
                                                            <Badge variant="amber">
                                                                Low
                                                            </Badge>
                                                        )}
                                                    </span>
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
                                                    <span className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEdit(
                                                                    product,
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        {product.is_active ? (
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setPendingDeactivate(
                                                                        product,
                                                                    )
                                                                }
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="plain"
                                                                size="sm"
                                                                onClick={() =>
                                                                    reactivate(
                                                                        product,
                                                                    )
                                                                }
                                                            >
                                                                Reactivate
                                                            </Button>
                                                        )}
                                                    </span>
                                                </Cell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-4">
                                <EmptyState
                                    icon="search"
                                    title="No products found"
                                    description="Try a different name, SKU, barcode, or category."
                                />
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>

            <Drawer
                open={drawer.open}
                onClose={closeDrawer}
                title={drawer.product ? 'Edit product' : 'Add product'}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="plain" onClick={closeDrawer}>
                            Cancel
                        </Button>
                        <Button type="submit" form="product-form">
                            Save product
                        </Button>
                    </div>
                }
            >
                <ProductForm
                    product={drawer.product}
                    categories={categories}
                    catalog={catalog}
                    onSave={saveProduct}
                />
            </Drawer>

            <Modal
                open={pendingDeactivate !== null}
                onClose={() => setPendingDeactivate(null)}
                title="Deactivate product"
            >
                <p className="text-body text-raisin">
                    Turn off sales for{' '}
                    <span className="font-semibold">
                        {pendingDeactivate?.name}
                    </span>
                    ? It will disappear from the POS and search, but stay in
                    your catalog and history. You can reactivate it any time.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setPendingDeactivate(null)}
                    >
                        Keep active
                    </Button>
                    <Button variant="danger" onClick={confirmDeactivate}>
                        Deactivate
                    </Button>
                </div>
            </Modal>

            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </>
    );
}

function ProductForm({
    product,
    categories,
    catalog,
    onSave,
}: {
    product: Product | null;
    categories: Category[];
    catalog: Product[];
    onSave: (payload: ProductPayload) => void;
}) {
    const [draft, setDraft] = useState<ProductForm>(() =>
        product ? toForm(product) : emptyForm,
    );
    const [errors, setErrors] = useState<FormErrors>({});

    function update(field: keyof ProductForm, value: string) {
        setDraft((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            if (current[field] === undefined) {
                return current;
            }

            const next = { ...current };

            delete next[field];

            return next;
        });
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const editingId = product?.id ?? null;
        const nextErrors = validateForm(draft, catalog, editingId);

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        onSave({
            name: draft.name.trim(),
            sku: draft.sku.trim(),
            barcode: draft.barcode.trim() || null,
            categoryId: draft.categoryId || null,
            unit: draft.unit.trim(),
            cost_price: parsePesewas(draft.cost) as number,
            selling_price: parsePesewas(draft.selling) as number,
            reorder_threshold: Number.parseFloat(draft.threshold),
        });
    }

    return (
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            <Field
                label="Name"
                htmlFor="product-name"
                required
                error={errors.name}
            >
                <Input
                    id="product-name"
                    type="text"
                    value={draft.name}
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="e.g. FanIce Yoghurt Sachet"
                />
            </Field>

            <Field
                label="SKU / code"
                htmlFor="product-sku"
                required
                error={errors.sku}
                hint="Unique — used for search."
            >
                <Input
                    id="product-sku"
                    type="text"
                    value={draft.sku}
                    onChange={(event) => update('sku', event.target.value)}
                    placeholder="e.g. FV-001"
                />
            </Field>

            <Field
                label="Barcode"
                htmlFor="product-barcode"
                error={errors.barcode}
                hint="Optional. Type it, or scan straight into this field."
            >
                <Input
                    id="product-barcode"
                    type="text"
                    value={draft.barcode}
                    onChange={(event) => update('barcode', event.target.value)}
                    placeholder="Scan or type"
                />
            </Field>

            <Field
                label="Category"
                htmlFor="product-category"
                hint="Optional — helps filtering."
            >
                <select
                    id="product-category"
                    value={draft.categoryId}
                    onChange={(event) =>
                        update('categoryId', event.target.value)
                    }
                    className="w-full rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none focus:ring-2 focus:ring-amber"
                >
                    <option value="">No category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field
                label="Unit"
                htmlFor="product-unit"
                required
                error={errors.unit}
            >
                <Input
                    id="product-unit"
                    type="text"
                    value={draft.unit}
                    onChange={(event) => update('unit', event.target.value)}
                    placeholder="e.g. tin, sachet, bottle"
                />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Cost price"
                    htmlFor="product-cost"
                    required
                    error={errors.cost}
                >
                    <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-label text-spanish-gray">
                            GH₵
                        </span>
                        <Input
                            id="product-cost"
                            type="text"
                            inputMode="decimal"
                            value={draft.cost}
                            onChange={(event) =>
                                update('cost', event.target.value)
                            }
                            placeholder="0.00"
                            className="pl-9"
                        />
                    </div>
                </Field>

                <Field
                    label="Selling price"
                    htmlFor="product-selling"
                    required
                    error={errors.selling}
                >
                    <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-label text-spanish-gray">
                            GH₵
                        </span>
                        <Input
                            id="product-selling"
                            type="text"
                            inputMode="decimal"
                            value={draft.selling}
                            onChange={(event) =>
                                update('selling', event.target.value)
                            }
                            placeholder="0.00"
                            className="pl-9"
                        />
                    </div>
                </Field>
            </div>

            <Field
                label="Reorder threshold"
                htmlFor="product-threshold"
                required
                error={errors.threshold}
                hint="When stock hits this, the item turns amber."
            >
                <Input
                    id="product-threshold"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={draft.threshold}
                    onChange={(event) =>
                        update('threshold', event.target.value)
                    }
                    placeholder="0"
                />
            </Field>
        </form>
    );
}

function Field({
    label,
    htmlFor,
    required,
    error,
    hint,
    children,
}: {
    label: string;
    htmlFor: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-label font-medium text-raisin"
            >
                {label}
                {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
            {children}
            {error ? (
                <p className="mt-1.5 text-label text-danger">{error}</p>
            ) : (
                hint && (
                    <p className="mt-1.5 text-label text-spanish-gray">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}
