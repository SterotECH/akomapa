import { formatGhs } from '@/lib/format';
import { cn } from '@/lib/utils';

interface MoneyProps {
    pesewas: number;
    className?: string;
}

export function Money({ pesewas, className }: MoneyProps) {
    return (
        <span className={cn('text-figure tabular-nums', className)}>
            {formatGhs(pesewas)}
        </span>
    );
}
