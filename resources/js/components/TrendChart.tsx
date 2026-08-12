import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatGhs } from '@/lib/format';

export type SalesPoint = {
    label: string;
    value: number;
};

function useThemeVar(name: string): string {
    const [value, setValue] = useState('');

    useEffect(() => {
        const read = () =>
            setValue(
                getComputedStyle(document.documentElement)
                    .getPropertyValue(name)
                    .trim(),
            );

        read();

        const observer = new MutationObserver(read);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [name]);

    return value;
}

function ChartTooltip({
    active,
    payload,
    cardBg,
    line,
    muted,
    raisin,
}: {
    active?: boolean;
    payload?: ReadonlyArray<{ payload?: SalesPoint }>;
    cardBg: string;
    line: string;
    muted: string;
    raisin: string;
}) {
    const first = payload?.[0];

    if (!active || first?.payload == null) {
        return null;
    }

    const point = first.payload;

    return (
        <div
            className="rounded-md border px-3 py-2 shadow-card"
            style={{ backgroundColor: cardBg, borderColor: line }}
        >
            <p className="text-label" style={{ color: muted }}>
                {point.label}
            </p>
            <p
                className="text-figure font-semibold tabular-nums"
                style={{ color: raisin }}
            >
                {formatGhs(point.value)}
            </p>
        </div>
    );
}

export function TrendChart({ data }: { data: SalesPoint[] }) {
    const green = useThemeVar('--color-green');
    const raisin = useThemeVar('--color-raisin');
    const line = useThemeVar('--color-line');
    const muted = useThemeVar('--ui-muted');
    const cardBg = useThemeVar('--ui-white');
    const lastIndex = data.length - 1;
    const gradientId = `sales-fill-${lastIndex}`;

    return (
        <div className="min-h-40 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0%" stopColor={green} stopOpacity={0.22} />
                            <stop offset="100%" stopColor={green} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: muted, fontSize: 12, fontWeight: 600 }}
                        dy={4}
                    />
                    <YAxis hide domain={[0, (max: number) => max * 1.12]} />
                    <Tooltip
                        cursor={{ stroke: line, strokeDasharray: '4 4' }}
                        content={(props) => (
                            <ChartTooltip
                                {...props}
                                cardBg={cardBg}
                                line={line}
                                muted={muted}
                                raisin={raisin}
                            />
                        )}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={green}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ r: 4, fill: green, stroke: cardBg, strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
