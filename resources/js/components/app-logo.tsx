/**
 * Full sidebar brand: large logo mark + VAULT wordmark.
 * No coloured square container — logo sits directly, background is transparent.
 */
export default function AppLogo() {
    return (
        <>
            {/* Icon — large, no background box */}
            <img
                src="/logo-transparent.png"
                alt="VAULT"
                className="dark:invert-0 invert size-10 object-contain shrink-0"
                draggable={false}
            />

            {/* Wordmark */}
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate leading-tight font-bold tracking-[0.2em] text-sm uppercase">
                    VAULT
                </span>
            </div>
        </>
    );
}
