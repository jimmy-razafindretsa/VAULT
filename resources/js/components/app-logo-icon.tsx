/**
 * Standalone icon mark — no wrapper background, no coloured square.
 * .dark:invert-0 invert in app.css handles dark/light blend-mode transparency.
 */
interface Props {
    className?: string;
}

export default function AppLogoIcon({ className = '' }: Props) {
    return (
        <img
            src="/logo-transparent.png"
            alt="VAULT"
            className={`dark:invert-0 invert object-contain ${className}`}
            draggable={false}
        />
    );
}
