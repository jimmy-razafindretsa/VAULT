import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { dashboard } from '@/routes';
import credentials from '@/routes/credentials';
import { Search, Plus, Eye, EyeOff, ExternalLink, Trash2, X, Copy, Check } from 'lucide-react';

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
            className="group relative aspect-square flex flex-col items-center justify-center gap-3 border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 p-4 cursor-pointer"
        >
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center">
                {favicon && !imgError ? (
                    <img
                        src={favicon}
                        alt={credential.name}
                        className="w-10 h-10 object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-10 h-10 flex items-center justify-center border border-white/10 text-white/40 text-lg font-light">
                        {getInitial(credential.name)}
                    </div>
                )}
            </div>

            {/* Name */}
            <span className="text-[11px] tracking-[0.1em] text-white/50 group-hover:text-white/80 transition-colors uppercase truncate w-full text-center">
                {credential.name}
            </span>

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
        </button>
    );
}

// ─── Add new card ─────────────────────────────────────────────────────────────
function AddCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group aspect-square flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer"
        >
            <div className="w-8 h-8 flex items-center justify-center border border-white/15 group-hover:border-white/40 transition-colors">
                <Plus className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors" />
            </div>
            <span className="text-[10px] tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors uppercase">
                Add
            </span>
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
        <button
            onClick={handleCopy}
            className="text-white/20 hover:text-white/60 transition-colors ml-2 shrink-0"
            title="Copy"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-white/50" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value, secret = false }: { label: string; value: string | null; secret?: boolean }) {
    const [visible, setVisible] = useState(false);
    if (!value) return null;

    return (
        <div className="py-4 border-b border-white/6 last:border-0">
            <div className="text-[9px] tracking-[0.25em] text-white/25 uppercase mb-2">{label}</div>
            <div className="flex items-center gap-2">
                <span className="text-[13px] text-white/70 leading-relaxed font-mono break-all">
                    {secret && !visible ? '•'.repeat(Math.min(value.length, 24)) : value}
                </span>
                {secret && (
                    <button
                        onClick={() => setVisible(!visible)}
                        className="text-white/20 hover:text-white/60 transition-colors ml-1 shrink-0"
                    >
                        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                )}
                <CopyButton value={value} />
            </div>
        </div>
    );
}

// ─── Modal backdrop ───────────────────────────────────────────────────────────
function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full sm:max-w-md">
                {children}
            </div>
        </div>
    );
}

// ─── View / Edit modal ────────────────────────────────────────────────────────
function ViewModal({
    credential,
    onClose,
    onEdit,
}: {
    credential: Credential;
    onClose: () => void;
    onEdit: () => void;
}) {
    const favicon = getFaviconUrl(credential.url);
    const [imgError, setImgError] = useState(false);

    const handleDelete = () => {
        if (!confirm(`Remove "${credential.name}"?`)) return;
        router.delete(credentials.destroy.url(credential.id), {
            onSuccess: onClose,
        });
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-[#0f0f0f] border border-white/10 mx-4 sm:mx-0">
                {/* Header */}
                <div className="flex items-center gap-4 px-6 pt-6 pb-5 border-b border-white/6">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        {favicon && !imgError ? (
                            <img src={favicon} alt={credential.name} className="w-8 h-8 object-contain"
                                onError={() => setImgError(true)} />
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 text-sm">
                                {getInitial(credential.name)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-light text-white/90 truncate">{credential.name}</div>
                        {credential.url && (
                            <a href={credential.url} target="_blank" rel="noopener noreferrer"
                                className="text-[11px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1">
                                {credential.url.replace(/^https?:\/\//, '')}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                    <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-2">
                    <FieldRow label="Account / Email" value={credential.account_id} />
                    <FieldRow label="Password" value={credential.password} secret />
                    <FieldRow label="Notes" value={credential.notes} />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/6 flex items-center justify-between">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-[11px] tracking-wide text-white/20 hover:text-red-400/70 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                    <button
                        onClick={onEdit}
                        className="text-[11px] tracking-[0.12em] uppercase border border-white/15 hover:border-white/40 px-5 py-2 transition-colors text-white/50 hover:text-white/80"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </ModalBackdrop>
    );
}

// ─── Add / Edit form modal ────────────────────────────────────────────────────
type FormMode = 'add' | 'edit';

function FormModal({
    mode,
    credential,
    onClose,
}: {
    mode: FormMode;
    credential?: Credential;
    onClose: () => void;
}) {
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
            router.post(credentials.store.url(), data, {
                onSuccess: () => { reset(); onClose(); },
            });
        } else if (credential) {
            router.put(credentials.update.url(credential.id), data, {
                onSuccess: () => onClose(),
            });
        }
    };

    const inputClass = "w-full bg-transparent border-b border-white/10 focus:border-white/35 outline-none text-[13px] text-white/80 placeholder-white/20 py-2.5 transition-colors";
    const labelClass = "block text-[9px] tracking-[0.25em] text-white/25 uppercase mb-1";

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-[#0f0f0f] border border-white/10 mx-4 sm:mx-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/6">
                    <span className="text-[11px] tracking-[0.2em] text-white/50 uppercase">
                        {mode === 'add' ? 'New service' : 'Edit service'}
                    </span>
                    <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pt-6 pb-4 space-y-5">
                    <div>
                        <label className={labelClass}>Name *</label>
                        <input
                            className={inputClass}
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="YouTube, GitHub, etc."
                            required
                        />
                        {errors.name && <p className="text-[11px] text-red-400/70 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>URL</label>
                        <input
                            className={inputClass}
                            value={data.url}
                            onChange={e => setData('url', e.target.value)}
                            placeholder="https://youtube.com"
                            type="url"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Account / Email</label>
                        <input
                            className={inputClass}
                            value={data.account_id}
                            onChange={e => setData('account_id', e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Password</label>
                        <div className="relative flex items-center">
                            <input
                                className={`${inputClass} pr-8`}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                type={showPass ? 'text' : 'password'}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-0 text-white/20 hover:text-white/50 transition-colors"
                            >
                                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Notes</label>
                        <textarea
                            className={`${inputClass} resize-none`}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Recovery code, security question, etc."
                            rows={2}
                        />
                    </div>

                    <div className="pt-2 pb-2 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[11px] tracking-wide text-white/25 hover:text-white/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="text-[11px] tracking-[0.12em] uppercase bg-white text-[#080808] px-7 py-2.5 font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
                        >
                            {processing ? 'Saving…' : mode === 'add' ? 'Add service' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    );
}

// ─── Main dashboard page ──────────────────────────────────────────────────────
interface DashboardProps {
    credentials: Credential[];
    filters: { search?: string };
}

export default function Dashboard({ credentials: creds = [], filters = {} }: DashboardProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Modal state
    const [viewTarget, setViewTarget] = useState<Credential | null>(null);
    const [editTarget, setEditTarget] = useState<Credential | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    // Debounced Inertia search
    const handleSearch = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(
                dashboard().url,
                { search: value || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 350);
    };

    const handleCloseAll = () => {
        setViewTarget(null);
        setEditTarget(null);
        setAddOpen(false);
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col p-6 md:p-8 gap-8">

                {/* ── Top bar ── */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search services…"
                            className="w-full bg-transparent border-b border-white/10 focus:border-white/30 outline-none pl-6 pb-2 text-[12px] text-white/60 placeholder-white/20 transition-colors"
                        />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Count */}
                    {creds.length > 0 && (
                        <span className="text-[10px] tracking-[0.15em] text-white/20 uppercase font-mono">
                            {creds.length} {creds.length === 1 ? 'service' : 'services'}
                        </span>
                    )}

                    {/* Add button */}
                    <button
                        onClick={() => setAddOpen(true)}
                        className="group flex items-center gap-2 border border-white/15 hover:border-white/40 px-4 py-2 transition-all duration-200"
                    >
                        <Plus className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
                        <span className="text-[11px] tracking-[0.12em] text-white/40 group-hover:text-white/70 transition-colors uppercase">
                            Add service
                        </span>
                    </button>
                </div>

                {/* ── Grid ── */}
                {creds.length === 0 && !search ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
                        <div className="w-px h-16 bg-white/8" />
                        <div className="text-center">
                            <p className="text-sm text-white/25 mb-1 tracking-wide">Your vault is empty.</p>
                            <p className="text-[12px] text-white/15">Add your first service to get started.</p>
                        </div>
                        <button
                            onClick={() => setAddOpen(true)}
                            className="group flex items-center gap-2 border border-dashed border-white/15 hover:border-white/35 px-6 py-3 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50" />
                            <span className="text-[11px] tracking-[0.15em] text-white/25 group-hover:text-white/50 uppercase">
                                Add first service
                            </span>
                        </button>
                    </div>
                ) : creds.length === 0 && search ? (
                    /* No results */
                    <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
                        <p className="text-[12px] text-white/25 tracking-wide">
                            No services match <span className="text-white/50">"{search}"</span>
                        </p>
                    </div>
                ) : (
                    /* Grid */
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {creds.map(cred => (
                            <CredentialCard
                                key={cred.id}
                                credential={cred}
                                onClick={() => setViewTarget(cred)}
                            />
                        ))}
                        <AddCard onClick={() => setAddOpen(true)} />
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {viewTarget && !editTarget && (
                <ViewModal
                    credential={viewTarget}
                    onClose={handleCloseAll}
                    onEdit={() => { setEditTarget(viewTarget); setViewTarget(null); }}
                />
            )}
            {editTarget && (
                <FormModal
                    mode="edit"
                    credential={editTarget}
                    onClose={handleCloseAll}
                />
            )}
            {addOpen && (
                <FormModal
                    mode="add"
                    onClose={handleCloseAll}
                />
            )}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
