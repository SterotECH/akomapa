import { Head } from '@inertiajs/react';

export default function Placeholder({
    title,
    task,
}: {
    title: string;
    task: string;
}) {
    return (
        <>
            <Head title={title} />
            <div className="flex min-h-full items-center justify-center">
                <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-card">
                    <p className="text-label tracking-wide text-spanish-gray uppercase">
                        Build in progress
                    </p>
                    <h2 className="mt-2 text-title text-raisin">{title}</h2>
                    <p className="mt-1 text-body text-spanish-gray">
                        This screen ships with {task} of the build order.
                    </p>
                </div>
            </div>
        </>
    );
}
