import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { Input, SearchField } from '@/components/Input';
import { Modal } from '@/components/Modal';
import {
    Cell,
    DataTable,
    HeaderCell,
    TableBody,
    TableHead,
    TableRow,
} from '@/components/Table';
import { ToastStack, useToasts } from '@/components/Toast';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import {
    store as categoriesStore,
    show as categoriesShow,
    update as categoriesUpdate,
    destroy as categoriesDestroy,
} from '@/routes/categories';
import type { Category } from '@/types';

type CategoriesPageProps = {
    categories: (Category & { products_count: number })[];
};

export default function Categories({ categories }: CategoriesPageProps) {
    const { gentle } = useSprings();
    const { toasts, push, dismiss } = useToasts();
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (term.length === 0) {
            return categories;
        }

        return categories.filter((category) =>
            category.name.toLowerCase().includes(term),
        );
    }, [categories, search]);

    function openCreate() {
        setEditingCategory(null);
        setDrawerOpen(true);
    }

    function openEdit(category: Category) {
        setEditingCategory(category);
        setDrawerOpen(true);
    }

    function handleSave(name: string) {
        if (editingCategory) {
            router.patch(
                categoriesUpdate.url(editingCategory.id),
                { name },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        push(`Updated ${name}`, 'success');
                        setDrawerOpen(false);
                    },
                },
            );
        } else {
            router.post(
                categoriesStore.url(),
                { name },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        push(`Created ${name}`, 'success');
                        setDrawerOpen(false);
                    },
                },
            );
        }
    }

    function confirmDelete(category: Category) {
        setPendingDelete(category);
    }

    function handleDelete() {
        if (!pendingDelete) return;

        router.delete(categoriesDestroy.url(pendingDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                push(`Deleted ${pendingDelete.name}`, 'success');
                setPendingDelete(null);
            },
        });
    }

    return (
        <>
            <Head title="Categories" />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={gentle}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-body text-spanish-gray">
                        Organize your products into groups.
                    </p>
                    <Button onClick={openCreate}>
                        <Icon name="plus" className="size-4" />
                        New category
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow-card">
                    <div className="border-b border-line px-5 py-4">
                        <SearchField
                            placeholder="Search categories…"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search categories"
                        />
                    </div>

                    {filtered.length > 0 ? (
                        <DataTable stickyHeader columns={[50, 15, 15, 20]}>
                            <TableHead>
                                <TableRow>
                                    <HeaderCell>Name</HeaderCell>
                                    <HeaderCell align="right">
                                        Products
                                    </HeaderCell>
                                    <HeaderCell align="right">
                                        Actions
                                    </HeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((category) => (
                                    <TableRow key={category.id}>
                                        <Cell>
                                            <Link
                                                href={categoriesShow.url(category.id)}
                                                className="text-title text-raisin transition-colors duration-fast hover:text-amber-deep"
                                            >
                                                {category.name}
                                            </Link>
                                        </Cell>
                                        <Cell align="right">
                                            <Badge variant="muted">
                                                {category.products_count.toLocaleString(
                                                    'en-GH',
                                                )}
                                            </Badge>
                                        </Cell>
                                        <Cell align="right">
                                            <span className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={categoriesShow.url(category.id)}
                                                    className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
                                                    title="View category"
                                                >
                                                    <Icon name="eye" className="size-4" />
                                                </Link>
                                                <Button
                                                    variant="plain"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(category)
                                                    }
                                                    title="Edit category"
                                                >
                                                    <Icon name="edit" className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        confirmDelete(category)
                                                    }
                                                    title="Delete category"
                                                >
                                                    <Icon name="trash" className="size-4" />
                                                </Button>
                                            </span>
                                        </Cell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </DataTable>
                    ) : (
                        <div className="p-4">
                            <EmptyState
                                icon="categories"
                                title="No categories yet"
                                description="Create your first category to organize products."
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            <CategoryDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                category={editingCategory}
                onSave={handleSave}
            />

            <Modal
                open={pendingDelete !== null}
                onClose={() => setPendingDelete(null)}
                title="Delete category"
            >
                <div className="space-y-4">
                    <p className="text-body text-raisin">
                        Are you sure you want to delete{' '}
                        <strong>{pendingDelete?.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setPendingDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            <Icon name="trash" className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </>
    );
}

function CategoryDrawer({
    open,
    onClose,
    category,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    category: Category | null;
    onSave: (name: string) => void;
}) {
    const [name, setName] = useState(category?.name ?? '');
    const [error, setError] = useState('');

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const trimmed = name.trim();

        if (trimmed.length === 0) {
            setError('Name is required');
            return;
        }

        onSave(trimmed);
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={category ? 'Edit category' : 'New category'}
            footer={
                <Button type="submit" form="category-form" className="w-full">
                    <Icon name="check" className="size-4" />
                    {category ? 'Save changes' : 'Create category'}
                </Button>
            }
        >
            <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="category-name"
                        className="mb-1.5 block text-label font-medium text-raisin"
                    >
                        Name
                    </label>
                    <Input
                        id="category-name"
                        type="text"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            setError('');
                        }}
                        placeholder="e.g. Food Items"
                        autoFocus
                    />
                    {error && (
                        <p className="mt-1.5 text-label text-danger">{error}</p>
                    )}
                </div>
            </form>
        </Drawer>
    );
}
