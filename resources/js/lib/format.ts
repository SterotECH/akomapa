export function formatGhs(pesewas: number): string {
    const cedi = pesewas / 100;
    const amount = cedi.toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `GH₵ ${amount}`;
}
