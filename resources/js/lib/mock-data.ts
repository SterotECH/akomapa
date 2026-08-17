import { createMockId } from '@/lib/mock-id';
import type {
    Category,
    Product,
    ProductSummary,
    Sale,
    SaleLineItem,
    StockMovement,
} from '@/types';

export const categories: Category[] = [
    { id: '01KZSJQXP29WW1E3W5Q7Y6MDZY', name: 'Beverages' },
    { id: '01KZSJQXP29WW1E3W5Q7Y6MDZZ', name: 'Provisions' },
    { id: '01KZSJQXP29WW1E3W5Q7Y6ME00', name: 'Grains' },
    { id: '01KZSJQXP29WW1E3W5Q7Y6ME01', name: 'Household' },
    { id: '01KZSJQXP29WW1E3W5Q7Y6ME02', name: 'Snacks' },
];

const categoryByName = (name: string): Category | null =>
    categories.find((category) => category.name === name) ?? null;

type ProductSeed = Omit<Product, 'is_low_stock' | 'stock_value'>;

const productSeeds: ProductSeed[] = [
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME03',
        sku: 'FV-001',
        name: 'FanIce Yoghurt Sachet',
        barcode: '6221000010001',
        category: categoryByName('Beverages'),
        unit: 'sachet',
        cost_price: 50,
        selling_price: 80,
        reorder_threshold: 24,
        is_active: true,
        stock_on_hand: 120,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME04',
        sku: 'BV-002',
        name: 'Ideal Milk 370g',
        barcode: '6221000010002',
        category: categoryByName('Beverages'),
        unit: 'tin',
        cost_price: 950,
        selling_price: 1200,
        reorder_threshold: 12,
        is_active: true,
        stock_on_hand: 6,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME05',
        sku: 'BV-003',
        name: 'Milo 500g',
        barcode: null,
        category: categoryByName('Beverages'),
        unit: 'tin',
        cost_price: 2900,
        selling_price: 3500,
        reorder_threshold: 6,
        is_active: true,
        stock_on_hand: 9,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME06',
        sku: 'PR-001',
        name: 'Peak Milk 170g',
        barcode: '6221000010003',
        category: categoryByName('Provisions'),
        unit: 'tin',
        cost_price: 650,
        selling_price: 900,
        reorder_threshold: 12,
        is_active: true,
        stock_on_hand: 18,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME07',
        sku: 'GR-001',
        name: 'Sachet Gari 900g',
        barcode: null,
        category: categoryByName('Grains'),
        unit: 'sachet',
        cost_price: 700,
        selling_price: 1000,
        reorder_threshold: 10,
        is_active: true,
        stock_on_hand: 14,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME08',
        sku: 'PR-002',
        name: 'Ghana Pepper Sauce 450g',
        barcode: '6221000010004',
        category: categoryByName('Provisions'),
        unit: 'bottle',
        cost_price: 1200,
        selling_price: 1600,
        reorder_threshold: 8,
        is_active: true,
        stock_on_hand: 3,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME09',
        sku: 'PR-003',
        name: 'Shito 300g',
        barcode: null,
        category: categoryByName('Provisions'),
        unit: 'jar',
        cost_price: 1800,
        selling_price: 2400,
        reorder_threshold: 6,
        is_active: true,
        stock_on_hand: 5,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0A',
        sku: 'BV-004',
        name: 'Star Beer 330ml',
        barcode: '6221000010005',
        category: categoryByName('Beverages'),
        unit: 'bottle',
        cost_price: 550,
        selling_price: 750,
        reorder_threshold: 24,
        is_active: true,
        stock_on_hand: 42,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0B',
        sku: 'BV-005',
        name: 'Club Beer 330ml',
        barcode: '6221000010006',
        category: categoryByName('Beverages'),
        unit: 'bottle',
        cost_price: 550,
        selling_price: 750,
        reorder_threshold: 24,
        is_active: true,
        stock_on_hand: 38,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0C',
        sku: 'BV-006',
        name: 'Coca-Cola 50cl',
        barcode: '6221000010007',
        category: categoryByName('Beverages'),
        unit: 'bottle',
        cost_price: 350,
        selling_price: 500,
        reorder_threshold: 24,
        is_active: true,
        stock_on_hand: 60,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0D',
        sku: 'BV-007',
        name: 'Fanta Orange 50cl',
        barcode: '6221000010008',
        category: categoryByName('Beverages'),
        unit: 'bottle',
        cost_price: 350,
        selling_price: 500,
        reorder_threshold: 24,
        is_active: true,
        stock_on_hand: 55,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0E',
        sku: 'BV-008',
        name: 'Sachet Water 500ml',
        barcode: null,
        category: categoryByName('Beverages'),
        unit: 'sachet',
        cost_price: 30,
        selling_price: 50,
        reorder_threshold: 100,
        is_active: true,
        stock_on_hand: 200,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0F',
        sku: 'GR-002',
        name: 'Sampelle Gari 1kg',
        barcode: null,
        category: categoryByName('Grains'),
        unit: 'bag',
        cost_price: 1200,
        selling_price: 1600,
        reorder_threshold: 8,
        is_active: true,
        stock_on_hand: 12,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0G',
        sku: 'HH-001',
        name: 'Omo Washing Powder 190g',
        barcode: '6221000010009',
        category: categoryByName('Household'),
        unit: 'sachet',
        cost_price: 450,
        selling_price: 600,
        reorder_threshold: 20,
        is_active: true,
        stock_on_hand: 35,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0H',
        sku: 'HH-002',
        name: 'Key Soap 250g',
        barcode: null,
        category: categoryByName('Household'),
        unit: 'bar',
        cost_price: 350,
        selling_price: 500,
        reorder_threshold: 15,
        is_active: true,
        stock_on_hand: 20,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0J',
        sku: 'PR-004',
        name: 'Sardine 155g',
        barcode: '6221000010010',
        category: categoryByName('Provisions'),
        unit: 'tin',
        cost_price: 1000,
        selling_price: 1300,
        reorder_threshold: 10,
        is_active: true,
        stock_on_hand: 8,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0K',
        sku: 'BV-009',
        name: 'Bournvita 400g',
        barcode: null,
        category: categoryByName('Beverages'),
        unit: 'tin',
        cost_price: 2600,
        selling_price: 3200,
        reorder_threshold: 6,
        is_active: true,
        stock_on_hand: 11,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0M',
        sku: 'PR-005',
        name: 'Granulated Sugar 1kg',
        barcode: null,
        category: categoryByName('Provisions'),
        unit: 'pack',
        cost_price: 1300,
        selling_price: 1700,
        reorder_threshold: 10,
        is_active: true,
        stock_on_hand: 16,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0N',
        sku: 'GR-003',
        name: 'Royal Rice 5kg',
        barcode: '6221000010011',
        category: categoryByName('Grains'),
        unit: 'bag',
        cost_price: 6200,
        selling_price: 7800,
        reorder_threshold: 4,
        is_active: true,
        stock_on_hand: 6,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0P',
        sku: 'HH-003',
        name: 'Frytol Cooking Oil 1L',
        barcode: null,
        category: categoryByName('Household'),
        unit: 'bottle',
        cost_price: 1800,
        selling_price: 2300,
        reorder_threshold: 8,
        is_active: true,
        stock_on_hand: 10,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
    {
        id: '01KZSJQXP29WW1E3W5Q7Y6ME0Q',
        sku: 'SN-001',
        name: 'Royal Party Mix 200g',
        barcode: null,
        category: categoryByName('Snacks'),
        unit: 'pack',
        cost_price: 800,
        selling_price: 1100,
        reorder_threshold: 6,
        is_active: false,
        stock_on_hand: 4,
        created_at: '2026-07-14T09:00:00+00:00',
        updated_at: '2026-08-10T12:00:00+00:00',
    },
];

export const products: Product[] = productSeeds.map((product) => ({
    ...product,
    is_low_stock: product.stock_on_hand <= product.reorder_threshold,
    stock_value: product.cost_price * product.stock_on_hand,
}));

export const activeProducts = products.filter((product) => product.is_active);

export const lowStockProducts = activeProducts.filter(
    (product) => product.is_low_stock,
);

export const stockValue = activeProducts.reduce(
    (sum, product) => sum + product.stock_value,
    0,
);

export const todaySummary = {
    sales: 209_850,
    items: 47,
    lowStock: lowStockProducts.length,
};

export const todaySales = {
    count: todaySummary.items,
    total: todaySummary.sales,
};

const DAY_MS = 86_400_000;

export const salesWeek: { label: string; value: number }[] = (() => {
    const values = [
        142_400,
        138_900,
        151_200,
        163_800,
        175_100,
        190_500,
        todaySummary.sales,
    ];

    return values.map((value, index) => {
        const date = new Date(
            Date.now() - (values.length - 1 - index) * DAY_MS,
        );

        return {
            label: date.toLocaleDateString('en-GH', { weekday: 'short' }),
            value,
        };
    });
})();

const minutesAgo = (minutes: number) =>
    new Date(Date.now() - minutes * 60_000).toISOString();

const movement = (
    product: Product,
    type: StockMovement['type'],
    quantity: number,
    minutes: number,
    note: string | null,
    suffix = '',
): StockMovement => {
    const summary: ProductSummary = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
    };

    return {
        id: `${product.id}${type[0].toUpperCase()}${suffix}`,
        product_id: product.id,
        type,
        quantity,
        occurred_at: minutesAgo(minutes),
        note,
        sale_id: type === 'sale' ? '01KZSJQXP29WW1E3W5Q7Y6ME0R' : null,
        product: summary,
    };
};

const byId = (id: string): Product =>
    products.find((product) => product.id === id) as Product;

const sell = (product: Product, quantity: number) => ({ product, quantity });

const atHour = (daysAgo: number, hour: number, minute: number): string => {
    const date = new Date(Date.now() - daysAgo * DAY_MS);
    date.setHours(hour, minute, 0, 0);

    return date.toISOString();
};

type SaleSeed = {
    daysAgo: number;
    hour: number;
    minute: number;
    rows: Array<{ product: Product; quantity: number }>;
};

const saleSeeds: SaleSeed[] = [
    {
        daysAgo: 0,
        hour: 8,
        minute: 12,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME03'), 10),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0E'), 20),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0B'), 6),
        ],
    },
    {
        daysAgo: 0,
        hour: 9,
        minute: 50,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME08'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME09'), 4),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0M'), 4),
        ],
    },
    {
        daysAgo: 0,
        hour: 11,
        minute: 35,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0N'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0P'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0G'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0H'), 4),
        ],
    },
    {
        daysAgo: 0,
        hour: 13,
        minute: 10,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0E'), 40),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME03'), 20),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'), 24),
        ],
    },
    {
        daysAgo: 0,
        hour: 15,
        minute: 20,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME04'), 4),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME05'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0K'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME06'), 6),
        ],
    },
    {
        daysAgo: 0,
        hour: 18,
        minute: 45,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0D'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME07'), 4),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0J'), 6),
        ],
    },
    {
        daysAgo: 1,
        hour: 8,
        minute: 30,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME04'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME06'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0G'), 4),
        ],
    },
    {
        daysAgo: 1,
        hour: 12,
        minute: 5,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0N'), 3),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0P'), 3),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0M'), 6),
        ],
    },
    {
        daysAgo: 1,
        hour: 17,
        minute: 40,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0D'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME03'), 12),
        ],
    },
    {
        daysAgo: 2,
        hour: 9,
        minute: 15,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME09'), 3),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME08'), 4),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0J'), 4),
        ],
    },
    {
        daysAgo: 2,
        hour: 14,
        minute: 30,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME05'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0K'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME07'), 6),
        ],
    },
    {
        daysAgo: 2,
        hour: 19,
        minute: 0,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0B'), 24),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0E'), 20),
        ],
    },
    {
        daysAgo: 3,
        hour: 8,
        minute: 45,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME06'), 8),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME04'), 4),
        ],
    },
    {
        daysAgo: 3,
        hour: 12,
        minute: 30,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0N'), 4),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0P'), 2),
        ],
    },
    {
        daysAgo: 3,
        hour: 16,
        minute: 55,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME03'), 30),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'), 12),
        ],
    },
    {
        daysAgo: 4,
        hour: 10,
        minute: 20,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0G'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0H'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0M'), 4),
        ],
    },
    {
        daysAgo: 4,
        hour: 13,
        minute: 45,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME09'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME08'), 3),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0J'), 3),
        ],
    },
    {
        daysAgo: 4,
        hour: 18,
        minute: 15,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME05'), 3),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0K'), 2),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME04'), 4),
        ],
    },
    {
        daysAgo: 5,
        hour: 9,
        minute: 0,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0B'), 12),
        ],
    },
    {
        daysAgo: 5,
        hour: 11,
        minute: 40,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME07'), 5),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0F'), 3),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0N'), 1),
        ],
    },
    {
        daysAgo: 5,
        hour: 17,
        minute: 20,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0D'), 12),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME03'), 24),
        ],
    },
    {
        daysAgo: 6,
        hour: 8,
        minute: 20,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME04'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME06'), 6),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0G'), 4),
        ],
    },
    {
        daysAgo: 6,
        hour: 12,
        minute: 50,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0P'), 4),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0M'), 5),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME09'), 2),
        ],
    },
    {
        daysAgo: 6,
        hour: 18,
        minute: 30,
        rows: [
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'), 18),
            sell(byId('01KZSJQXP29WW1E3W5Q7Y6ME0E'), 24),
        ],
    },
];

export const mockSales: Sale[] = saleSeeds.map((seed, index) => {
    const lineItems: SaleLineItem[] = seed.rows.map((row) => ({
        id: createMockId(),
        product_id: row.product.id,
        product_snapshot: `${row.product.name} · ${row.product.unit}`,
        quantity: row.quantity,
        unit_price: row.product.selling_price,
        line_total: row.product.selling_price * row.quantity,
    }));

    return {
        id: createMockId(),
        sale_number: `TS-2026-${String(184 - index).padStart(4, '0')}`,
        sold_at: atHour(seed.daysAgo, seed.hour, seed.minute),
        total: lineItems.reduce((sum, line) => sum + line.line_total, 0),
        items_count: lineItems.reduce((sum, line) => sum + line.quantity, 0),
        voided_at: null,
        void_reason: null,
        line_items: lineItems,
    };
});

export const recentMovements: StockMovement[] = [
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'),
        'restock',
        24,
        180,
        'Weekend order',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME04'), 'sale', -6, 120, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0E'),
        'restock',
        40,
        300,
        'Morning delivery',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'), 'sale', -12, 240, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME09'),
        'adjustment',
        -2,
        480,
        'Shelf damage',
    ),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0N'),
        'restock',
        10,
        1560,
        'Supplier A delivery',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME0J'), 'sale', -4, 420, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME03'),
        'restock',
        20,
        1800,
        'Ice cream van drop',
    ),
];

export const stockMovements: StockMovement[] = [
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0E'),
        'restock',
        40,
        25,
        'Morning delivery',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'), 'sale', -12, 45, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME09'),
        'adjustment',
        -2,
        60,
        'Shelf damage',
    ),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME04'),
        'sale',
        6,
        75,
        'Voided sale TS-2026-0184',
        'V',
    ),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0A'),
        'restock',
        24,
        95,
        'Weekend order',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME0J'), 'sale', -4, 120, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0N'),
        'restock',
        10,
        150,
        'Supplier A delivery',
    ),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0F'),
        'adjustment',
        2,
        180,
        'Count correction',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME05'), 'sale', -3, 210, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0B'),
        'restock',
        36,
        260,
        'Brewery drop',
    ),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0C'),
        'sale',
        8,
        300,
        'Voided sale TS-2026-0171',
        'V2',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME03'), 'sale', -10, 340, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0H'),
        'restock',
        12,
        420,
        'Weekly order',
    ),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0G'),
        'adjustment',
        -3,
        500,
        'Damaged packs',
    ),
    movement(byId('01KZSJQXP29WW1E3W5Q7Y6ME0P'), 'sale', -2, 600, 'Till sale'),
    movement(
        byId('01KZSJQXP29WW1E3W5Q7Y6ME0D'),
        'restock',
        30,
        720,
        'Distributor delivery',
    ),
];
