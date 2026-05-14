import { Form, Head, usePage, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { Fingerprint, Github, Chrome } from 'lucide-react';
import { SharedData } from '@/types';
import * as oauth from '@/routes/oauth';
import * as passkeyRoutes from '@/routes/passkeys';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function ConfirmPassword() {
    const { auth } = usePage<SharedData>().props;
    const { has_password, has_passkeys } = auth.user;
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
            
            router.post(passkeyRoutes.login().url, {
                passkey: JSON.stringify(passkey),
                remember: true,
            }, {
                onError: (errors) => {
                    if (errors.passkey) {
                        toast.error(errors.passkey);
                    }
                },
                onFinish: () => {
                    setAuthenticating(false);
                }
            });
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Passkey authentication failed');
            setAuthenticating(false);
        }
    };

    return (
        <>
            <Head title="Confirm identity" />

            <div className="space-y-6">
                {has_passkeys && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={loginWithPasskey}
                        disabled={authenticating}
                    >
                        {authenticating ? <Spinner className="mr-2" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                        Confirm with Passkey
                    </Button>
                )}

                {has_passkeys && (
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>
                )}

                {has_password ? (
                    <Form action={store.url()} method="post" resetOnSuccess={['password']}>
                        {({ processing, errors }) => (
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                    
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center">
                                    <Button
                                        className="w-full"
                                        disabled={processing}
                                        data-test="confirm-password-button"
                                    >
                                        {processing && <Spinner />}
                                        Confirm password
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                ) : (
                    <div className="grid gap-6">
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
                    </div>
                )}
            </div>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm your identity',
    description:
        'This is a secure area of the application. Please confirm your identity before continuing.',
};
