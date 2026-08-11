import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';

interface EmptyStateProps {
    icon: IconName;
    title: string;
    description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-white/50 px-6 py-12 text-center">
            <Icon name={icon} className="size-8 text-spanish-gray" />
            <p className="text-title text-raisin">{title}</p>
            {description && (
                <p className="text-body text-spanish-gray">{description}</p>
            )}
        </div>
    );
}
