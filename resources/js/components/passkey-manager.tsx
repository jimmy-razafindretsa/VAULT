import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import * as passkeyRoutes from '@/routes/passkeys';
import { dashboard } from '@/routes';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Passkey {
    id: number;
    name: string;
    created_at: string;
}

export default function PasskeyManager() {
    const [passkeys, setPasskeys] = useState<Passkey[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchPasskeys();
    }, []);

    const fetchPasskeys = async () => {
        try {
            const response = await axios.get(passkeyRoutes.index().url);
            setPasskeys(response.data.passkeys);
        } catch (error) {
            console.error('Failed to fetch passkeys', error);
        } finally {
            setLoading(false);
        }
    };

    const registerPasskey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;

        if (!window.browserSupportsWebAuthn()) {
            toast.error('Your browser does not support WebAuthn');
            return;
        }

        setRegistering(true);
        try {
            const { data: options } = await axios.get(passkeyRoutes.register_options().url);

            const passkey = await window.startRegistration({optionsJSON: options});

            await axios.post(passkeyRoutes.store().url, {
                name: newName,
                passkey: JSON.stringify(passkey),
            });

            toast.success('Passkey registered successfully');
            setNewName('');
            fetchPasskeys();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to register passkey');
        } finally {
            setRegistering(false);
        }
    };

    const deletePasskey = async (id: number) => {
        if (!confirm('Are you sure you want to delete this passkey?')) return;

        try {
            await axios.delete(passkeyRoutes.destroy(id).url);
            toast.success('Passkey deleted');
            fetchPasskeys();
        } catch (error) {
            toast.error('Failed to delete passkey');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Passkeys</CardTitle>
                <CardDescription>
                    Passkeys provide a more secure and easier way to log in without a password.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={registerPasskey} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="passkey-name">Passkey Name</Label>
                        <div className="flex gap-2">
                            <Input
                                id="passkey-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. My MacBook Pro"
                                disabled={registering}
                            />
                            <Button type="submit" disabled={registering || !newName}>
                                {registering && <Spinner className="mr-2" />}
                                Add Passkey
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Your Passkeys</h3>
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Spinner />
                        </div>
                    ) : passkeys.length === 0 ? (
                        <p className="text-sm text-muted-foreground">You haven't added any passkeys yet.</p>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {passkeys.map((passkey) => (
                                <div key={passkey.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-medium">{passkey.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Added on {new Date(passkey.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deletePasskey(passkey.id)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
