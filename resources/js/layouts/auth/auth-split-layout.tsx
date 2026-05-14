import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';


export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-medium"
                >
                    <img
                        src="/logo-transparent.png"
                        alt="VAULT"
                        className="h-12 w-12 object-contain"
                        
                        draggable={false}
                    />
                    <span className="font-bold tracking-[0.22em] uppercase">VAULT</span>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex flex-col items-center gap-3 lg:hidden"
                    >
                        <img
                            src="/logo-transparent.png"
                            alt="VAULT"
                            className="dark:invert-0 invert h-16 w-16 object-contain"
                            draggable={false}
                        />
                        <span className="font-bold tracking-[0.22em] text-lg uppercase">VAULT</span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
