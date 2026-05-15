import { Form, Head, usePage } from '@inertiajs/react';
import PasskeyManager from '@/components/passkey-manager';
import MfaManager from '@/components/mfa-manager';
import SessionManager from '@/components/session-manager';
import DeleteUser from '@/components/delete-user';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    sessions?: any[];
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    sessions = [],
}: Props) {
    const { auth } = usePage<any>().props;
    const { has_password } = auth.user;

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [showConfirmSetPasswordModal, setShowConfirmSetPasswordModal] = useState<boolean>(false);
    const [bypassIntercept, setBypassIntercept] = useState<boolean>(false);
    
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    const formProps = { action: SecurityController.update.url(), method: "put" as const };
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handlePasswordSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!has_password && !bypassIntercept) {
            e.preventDefault();
            setShowConfirmSetPasswordModal(true);
        }
    };

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={has_password ? "Update password" : "Set password"}
                    description={has_password ? "Ensure your account is using a long, random password to stay secure" : "Set a password for your account so you can log in without relying on third-party providers."}
                />

                <Form
                    {...formProps}
                    ref={formRef as any}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            {has_password && (
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Current password
                                    </Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                    />

                                    <InputError message={errors.current_password} />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    ref={submitButtonRef}
                                    onClick={handlePasswordSubmitClick}
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    Save password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <div className="space-y-6">
                <PasskeyManager />
                {canManageTwoFactor && <MfaManager />}
                <SessionManager sessions={sessions} />
                <DeleteUser />
            </div>

            <Dialog open={showConfirmSetPasswordModal} onOpenChange={setShowConfirmSetPasswordModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Account Password</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to set this password? Once set, you will be able to log in using this password instead of just relying on third-party providers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmSetPasswordModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            setShowConfirmSetPasswordModal(false);
                            setBypassIntercept(true);
                            setTimeout(() => {
                                submitButtonRef.current?.click();
                                // Reset the bypass intercept after clicking
                                setTimeout(() => setBypassIntercept(false), 100);
                            }, 50);
                        }}>
                            Yes, set password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
