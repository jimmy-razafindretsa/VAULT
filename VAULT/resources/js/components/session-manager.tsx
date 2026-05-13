import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { MonitorSmartphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
    id: string;
    agent: string;
    ip_address: string;
    is_current_device: boolean;
    last_active: string;
}

interface Props {
    sessions: Session[];
}

export default function SessionManager({ sessions }: Props) {
    const logoutSession = (id: string) => {
        router.delete(`/settings/security/sessions/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Session logged out successfully');
            },
        });
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Browser Sessions</CardTitle>
                <CardDescription>
                    Manage and log out your active sessions on other browsers and devices.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No active sessions found.</p>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-muted-foreground">
                                            <MonitorSmartphone className="size-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium flex items-center gap-2">
                                                {session.agent}
                                                {session.is_current_device && (
                                                    <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                        This session
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.ip_address} • {session.is_current_device ? 'Active now' : `Last active ${session.last_active}`}
                                            </p>
                                        </div>
                                    </div>
                                    {!session.is_current_device && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => logoutSession(session.id)}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                            title="Log out session"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
