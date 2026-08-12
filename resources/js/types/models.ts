export type Category = {
    id: string;
    name: string;
};

export type Product = {
    id: string;
    sku: string;
    name: string;
    barcode: string | null;
    category: Category | null;
    unit: string;
    cost_price: number;
    selling_price: number;
    reorder_threshold: number;
    is_active: boolean;
    stock_on_hand: number;
    is_low_stock: boolean;
    stock_value: number;
    created_at: string | null;
    updated_at: string | null;
};

export type ProductSummary = {
    id: string;
    sku: string;
    name: string;
    unit: string;
};

export type MovementType = 'restock' | 'sale' | 'adjustment';

export type StockMovement = {
    id: string;
    product_id: string;
    type: MovementType;
    quantity: number;
    occurred_at: string;
    note: string | null;
    sale_id: string | null;
    product?: ProductSummary;
};

export type SaleLineItem = {
    id: string;
    product_id: string;
    product_snapshot: string;
    quantity: number;
    unit_price: number;
    line_total: number;
};

export type Sale = {
    id: string;
    sale_number: string;
    sold_at: string;
    total: number;
    items_count: number;
    voided_at: string | null;
    void_reason: string | null;
    line_items: SaleLineItem[];
};

export type CartLine = {
    product_id: string;
    sku: string;
    name: string;
    unit: string;
    unit_price: number;
    quantity: number;
    line_total: number;
    stock_on_hand: number;
};

export type Flash = {
    success: string | null;
    error: string | null;
};
