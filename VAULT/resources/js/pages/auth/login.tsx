import { Form, Head, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import * as oauth from '@/routes/oauth';
import * as passkeyRoutes from '@/routes/passkeys';
import { dashboard } from '@/routes';
import { Github, Chrome, Fingerprint } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [authenticating, setAuthenticating] = useState(false);

    const loginWithPasskey = async () => {
        if (!window.browserSupportsWebAuthn()) {
            toast.error('Your browser does not support WebAuthn');
            return;
        }

        setAuthenticating(true);
        try {
            const { data: options } = await axios.get(passkeyRoutes.authentication_options().url);

            const passkey = await window.startAuthentication({ optionsJSON: options });

            const response = await axios.post(passkeyRoutes.login().url, {
                passkey: JSON.stringify(passkey),
                remember: true, // or track remember state if you have a checkbox for it
            });

            if (response.data.two_factor) {
                router.visit('/two-factor-challenge');
                return;
            }

            window.location.href = dashboard();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Passkey authentication failed');
        } finally {
            setAuthenticating(false);
        }
    };

    return (
        <>
            <Head title="Log in" />

            <div className="grid gap-6">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={loginWithPasskey}
                    disabled={authenticating}
                >
                    {authenticating ? <Spinner className="mr-2" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                    Log in with Passkey
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        asChild
                    >
                        <a href={oauth.redirect.url('github')}>
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        asChild
                    >
                        <a href={oauth.redirect.url('google')}>
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </a>
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                    onSuccess={(response: any) => {
                        if (response?.props?.two_factor) {
                            router.visit('/two-factor-challenge');
                        }
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">Remember me</Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <TextLink href={register()} tabIndex={5}>
                                        Sign up
                                    </TextLink>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
