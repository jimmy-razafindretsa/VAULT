import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { dashboard } from '@/routes';
import credentials from '@/routes/credentials';
import shares from '@/routes/shares';
import { Search, Plus, Eye, EyeOff, ExternalLink, Trash2, X, Copy, Check, Send, Bell } from 'lucide-react';
import PasswordEntropyBar from '@/components/password-entropy-bar';
import PasswordGenerator from '@/components/password-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Credential {
    id: number;
    name: string;
    url: string | null;
    account_id: string | null;
    password: string | null;
    notes: string | null;
}

// ─── Favicon helper ───────────────────────────────────────────────────────────
function getFaviconUrl(url: string | null): string | null {
    if (!url) return null;
    try {
        const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`);
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
        return null;
    }
}

function getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
}

// ─── Credential card ──────────────────────────────────────────────────────────
function CredentialCard({ credential, onClick }: { credential: Credential; onClick: () => void }) {
    const favicon = getFaviconUrl(credential.url);
    const [imgError, setImgError] = useState(false);

    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-accent transition-all duration-200 p-4 cursor-pointer aspect-square"
        >
            <div className="w-10 h-10 flex items-center justify-center">
                {favicon && !imgError ? (
                    <img
                        src={favicon}
                        alt={credential.name}
                        className="w-9 h-9 object-contain rounded-md"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground text-base font-medium">
                        {getInitial(credential.name)}
                    </div>
                )}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center font-medium">
                {credential.name}
            </span>
        </button>
    );
}

// ─── Add new card ─────────────────────────────────────────────────────────────
function AddCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-foreground/30 hover:bg-accent transition-all duration-200 cursor-pointer aspect-square"
        >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-border group-hover:border-foreground/30 transition-colors">
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">Add</span>
        </button>
    );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value, secret = false }: { label: string; value: string | null; secret?: boolean }) {
    const [visible, setVisible] = useState(false);
    if (!value) return null;
    return (
        <div className="flex items-center justify-between p-4">
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-mono text-foreground break-all">
                    {secret && !visible ? '•'.repeat(Math.min(value.length, 24)) : value}
                </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-3">
                {secret && (
                    <Button variant="ghost" size="icon" onClick={() => setVisible(!visible)} className="h-8 w-8">
                        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                )}
                <CopyButton value={value} />
            </div>
        </div>
    );
}

// ─── Modal backdrop ───────────────────────────────────────────────────────────
function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full sm:max-w-md px-4 sm:px-0"
                style={{ animation: 'modalIn 0.22s cubic-bezier(0.16,1,0.3,1) both' }}>
                {children}
            </div>
        </div>
    );
}

// ─── View modal ───────────────────────────────────────────────────────────────
function ViewModal({ credential, onClose, onEdit, onShare }: {
    credential: Credential; onClose: () => void; onEdit: () => void; onShare: () => void;
}) {
    const favicon = getFaviconUrl(credential.url);
    const [imgError, setImgError] = useState(false);

    const handleDelete = () => {
        if (!confirm(`Remove "${credential.name}"?`)) return;
        router.delete(credentials.destroy.url(credential.id), { onSuccess: onClose });
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <Card className="py-0 overflow-hidden">
                {/* Header */}
                <CardHeader className="flex flex-row items-center gap-4 px-6 py-5 border-b border-border">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        {favicon && !imgError ? (
                            <img src={favicon} alt={credential.name} className="w-8 h-8 object-contain rounded-md" onError={() => setImgError(true)} />
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground text-sm rounded-md font-medium">
                                {getInitial(credential.name)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{credential.name}</CardTitle>
                        {credential.url && (
                            <a href={credential.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-0.5">
                                {credential.url.replace(/^https?:\/\//, '')}
                                <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                {/* Fields */}
                <CardContent className="px-0 py-0">
                    <div className="divide-y rounded-none border-0">
                        <FieldRow label="Account / Email" value={credential.account_id} />
                        <FieldRow label="Password" value={credential.password} secret />
                        <FieldRow label="Notes" value={credential.notes} />
                    </div>
                </CardContent>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={handleDelete}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2">
                        <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onShare} className="gap-2">
                            <Send className="h-4 w-4" /> Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
                    </div>
                </div>
            </Card>
        </ModalBackdrop>
    );
}

// ─── Share modal ──────────────────────────────────────────────────────────────
function ShareModal({ credential, onClose }: { credential: Credential; onClose: () => void }) {
    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({ name: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(shares.store.url(credential.id), { onSuccess: () => reset() });
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <Card className="py-0 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border">
                    <div>
                        <CardTitle className="text-sm">Share Service</CardTitle>
                        <CardDescription className="truncate max-w-[220px] mt-0.5">{credential.name}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-6 pb-6">
                        {wasSuccessful && (
                            <div className="flex items-center gap-3 rounded-md border border-border bg-accent px-4 py-3">
                                <Check className="h-4 w-4 shrink-0 text-green-500" />
                                <p className="text-sm text-foreground">Invitation sent — they'll receive a link to accept it.</p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="share-name">Recipient Name</Label>
                            <Input
                                id="share-name"
                                type="text"
                                required
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Full name of recipient"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The recipient will receive an email with a one-time link to accept this credential. They must have a Vault account.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Send className="h-4 w-4" />
                                {processing ? 'Sending…' : 'Send invite'}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </ModalBackdrop>
    );
}

// ─── Add / Edit form modal ────────────────────────────────────────────────────
type FormMode = 'add' | 'edit';

function FormModal({ mode, credential, onClose }: { mode: FormMode; credential?: Credential; onClose: () => void }) {
    const { data, setData, processing, errors, reset } = useForm({
        name: credential?.name ?? '',
        url: credential?.url ?? '',
        account_id: credential?.account_id ?? '',
        password: credential?.password ?? '',
        notes: credential?.notes ?? '',
    });
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'add') {
            router.post(credentials.store.url(), data, { onSuccess: () => { reset(); onClose(); } });
        } else if (credential) {
            router.put(credentials.update.url(credential.id), data, { onSuccess: () => onClose() });
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <Card className="py-0 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border">
                    <CardTitle className="text-sm">{mode === 'add' ? 'New service' : 'Edit service'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-6 pb-6">
                        <div className="grid gap-2">
                            <Label htmlFor="svc-name">Name *</Label>
                            <Input id="svc-name" value={data.name} onChange={e => setData('name', e.target.value)}
                                placeholder="YouTube, GitHub, etc." required />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="svc-url">URL</Label>
                            <Input id="svc-url" value={data.url} onChange={e => setData('url', e.target.value)}
                                placeholder="https://youtube.com" type="url" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="svc-account">Account / Email</Label>
                            <Input id="svc-account" value={data.account_id} onChange={e => setData('account_id', e.target.value)}
                                placeholder="you@example.com" autoComplete="off" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="svc-password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="svc-password"
                                    value={data.password} onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••" type={showPass ? 'text' : 'password'}
                                    autoComplete="new-password" className="pr-10"
                                />
                                <Button type="button" variant="ghost" size="icon"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                                    {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                            {data.password && <PasswordEntropyBar password={data.password} />}
                            <PasswordGenerator onPasswordGenerated={(pass) => { setData('password', pass); setShowPass(true); }} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="svc-notes">Notes</Label>
                            <textarea
                                id="svc-notes"
                                value={data.notes} onChange={e => setData('notes', e.target.value)}
                                placeholder="Recovery code, security question, etc." rows={2}
                                className="border-input placeholder:text-muted-foreground flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : mode === 'add' ? 'Add service' : 'Save changes'}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </ModalBackdrop>
    );
}

// ─── Main dashboard page ──────────────────────────────────────────────────────
interface DashboardProps {
    credentials: Credential[];
    filters: { search?: string };
    pendingSharesCount?: number;
}

export default function Dashboard({ credentials: creds = [], filters = {}, pendingSharesCount = 0 }: DashboardProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const [viewTarget, setViewTarget]   = useState<Credential | null>(null);
    const [editTarget, setEditTarget]   = useState<Credential | null>(null);
    const [shareTarget, setShareTarget] = useState<Credential | null>(null);
    const [addOpen, setAddOpen]         = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(dashboard().url, { search: value || undefined }, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);
    };

    const handleCloseAll = () => {
        setViewTarget(null); setEditTarget(null); setShareTarget(null); setAddOpen(false);
    };

    return (
        <>
            <Head title="Dashboard" />
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <div className="flex flex-1 flex-col p-6 md:p-8 gap-6">

                {/* ── Top bar ── */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search — exact same as passkey-manager's Input */}
                    <div className="relative flex items-center flex-1 min-w-[180px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search services…"
                            className="pl-9"
                        />
                    </div>

                    {/* Notification */}
                    {pendingSharesCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]">
                            <Bell className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-medium">You've received a service — check your emails</span>
                        </div>
                    )}

                    <div className="flex-1" />

                    {creds.length > 0 && (
                        <span className="text-sm text-muted-foreground font-mono">
                            {creds.length} {creds.length === 1 ? 'service' : 'services'}
                        </span>
                    )}

                    {/* Add button — exact same as "Add Passkey" Button */}
                    <Button onClick={() => setAddOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add service
                    </Button>
                </div>

                {/* ── Grid ── */}
                {creds.length === 0 && !search ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
                        <p className="text-sm text-muted-foreground">Your vault is empty.</p>
                        <p className="text-xs text-muted-foreground">Add your first service to get started.</p>
                        <Button variant="outline" onClick={() => setAddOpen(true)} className="gap-2 mt-2">
                            <Plus className="h-4 w-4" /> Add first service
                        </Button>
                    </div>
                ) : creds.length === 0 && search ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24">
                        <p className="text-sm text-muted-foreground">
                            No services match <span className="text-foreground font-medium">"{search}"</span>
                        </p>
                    </div>
                ) : (
                    /* Service grid — cards styled identically to the passkey list items */
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                        {creds.map(cred => (
                            <CredentialCard key={cred.id} credential={cred} onClick={() => setViewTarget(cred)} />
                        ))}
                        <AddCard onClick={() => setAddOpen(true)} />
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {viewTarget && !editTarget && !shareTarget && (
                <ViewModal credential={viewTarget} onClose={handleCloseAll}
                    onEdit={() => { setEditTarget(viewTarget); setViewTarget(null); }}
                    onShare={() => { setShareTarget(viewTarget); setViewTarget(null); }} />
            )}
            {shareTarget && <ShareModal credential={shareTarget} onClose={handleCloseAll} />}
            {editTarget && <FormModal mode="edit" credential={editTarget} onClose={handleCloseAll} />}
            {addOpen && <FormModal mode="add" onClose={handleCloseAll} />}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
