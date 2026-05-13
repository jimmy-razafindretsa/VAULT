import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Fingerprint, Github, Chrome } from 'lucide-react';
import * as oauth from '@/routes/oauth';
import * as passkeyRoutes from '@/routes/passkeys';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { usePage, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Separator } from '@/components/ui/separator';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function ConfirmIdentityModal({ isOpen, onClose, onSuccess }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { has_passkeys } = auth.user;
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
                remember: true,
            });

            if (response.data.two_factor) {
                router.visit('/two-factor-challenge');
                return;
            }

            // Success, close modal and run callback
            onClose();
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Passkey authentication failed');
        } finally {
            setAuthenticating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm your identity</DialogTitle>
                    <DialogDescription>
                        Please confirm your identity before continuing.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
