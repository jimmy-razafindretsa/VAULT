import { Form, usePage } from '@inertiajs/react';
import { ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';

interface User {
    two_factor_confirmed_at: string | null;
    two_factor_enabled: boolean;
}

export default function MfaManager() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

    const {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        fetchSetupData,
        fetchRecoveryCodes,
        clearSetupData,
        errors
    } = useTwoFactorAuth();

    const twoFactorEnabled = !!auth.user.two_factor_confirmed_at;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {twoFactorEnabled ? (
                            <ShieldCheck className="size-5 text-green-500" />
                        ) : (
                            <ShieldOff className="size-5 text-muted-foreground" />
                        )}
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account using two-factor authentication.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!twoFactorEnabled ? (
                        <Form {...enable.form()} onSuccess={() => setIsSetupModalOpen(true)}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Enable 2FA
                                </Button>
                            )}
                        </Form>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Two-factor authentication is currently enabled.
                            </p>
                            <Form {...disable.form()}>
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        type="submit"
                                        disabled={processing}
                                        className="gap-2"
                                    >
                                        <Trash2 className="size-4" />
                                        Disable 2FA
                                    </Button>
                                )}
                            </Form>
                        </div>
                    )}
                </CardContent>
            </Card>

            {twoFactorEnabled && (
                <TwoFactorRecoveryCodes
                    recoveryCodesList={recoveryCodesList}
                    fetchRecoveryCodes={fetchRecoveryCodes}
                    errors={errors}
                />
            )}

            <TwoFactorSetupModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                requiresConfirmation={true}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
