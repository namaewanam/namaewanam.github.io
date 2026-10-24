/**
 * Inline script that runs before React hydration.
 * Sets the correct class on <html> to prevent FOUC,
 * rendered as a Server Component to avoid React 19 client-script warnings.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(d)}catch(e){}})()`;

export function ThemeScript() {
	return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
