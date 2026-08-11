import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/Input';
import AuthLayout from '@/layouts/AuthLayout';
import { store as loginStore } from '@/routes/login';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(loginStore.url(), {
            onSuccess: () => reset('password'),
        });
    }

    return (
        <>
            <Head title="Login" />

            <div className="w-full max-w-sm">
                <div>
                    <p className="text-wordmark text-raisin lg:hidden">
                        Akomapa{' '}
                        <span className="text-amber">
                            Neat<span className="text-green">.</span>
                        </span>
                    </p>
                    <h1 className="mt-8 text-display text-raisin lg:mt-0">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-body text-spanish-gray">
                        Sign in to your shop.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-1.5 block text-label font-medium text-raisin"
                        >
                            Username
                        </label>
                        <Input
                            id="username"
                            type="text"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={data.username}
                            onChange={(e) =>
                                setData('username', e.target.value)
                            }
                        />
                        {errors.username && (
                            <p
                                id="username-error"
                                className="mt-1.5 text-label text-danger"
                            >
                                {errors.username}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-label font-medium text-raisin"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                        />
                        {errors.password && (
                            <p
                                id="password-error"
                                className="mt-1.5 text-label text-danger"
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing ? (
                            <Icon
                                name="clock"
                                className="size-4 animate-spin"
                            />
                        ) : (
                            'Sign in'
                        )}
                        {!processing && (
                            <Icon name="arrow-right" className="size-4" />
                        )}
                    </Button>
                </form>
            </div>
        </>
    );
}

Login.layout = (page: ReactNode) => <AuthLayout>{page}</AuthLayout>;
