export function formatGhs(pesewas: number): string {
    const cedi = pesewas / 100;
    const amount = cedi.toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `GH₵ ${amount}`;
}

export function formatWhen(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const time = date.toLocaleTimeString('en-GH', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (isToday) {
        return `Today · ${time}`;
    }

    const day = date.toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'short',
    });

    return `${day} · ${time}`;
}

export function formatSignedQuantity(quantity: number): string {
    return `${quantity > 0 ? '+' : ''}${quantity}`;
}
