/**
 * Feature flags — centralized toggle system via environment variables.
 *
 * Every flag defaults to `true` so the site works out-of-the-box without
 * configuring anything. Set `NEXT_PUBLIC_FEATURE_<NAME>=false` to disable
 * a feature at build time.
 *
 * Because all variables use the `NEXT_PUBLIC_` prefix, they are inlined
 * at build time by Next.js and tree-shaken in the static export.
 */

function isEnabled(envVar: string | undefined, defaultValue = true): boolean {
	if (envVar === undefined || envVar === '') return defaultValue;
	return envVar.toLowerCase() !== 'false' && envVar !== '0';
}

export const features = {
	// Existing features

	/** Giscus comment widget on blog posts (GitHub Discussions). */
	comments: isEnabled(process.env.NEXT_PUBLIC_FEATURE_COMMENTS),

	/** Thin reading-progress bar fixed to the top of the viewport. */
	readingProgress: isEnabled(process.env.NEXT_PUBLIC_FEATURE_READING_PROGRESS),

	/** Command palette (⌘K) and its trigger button in the header. */
	commandPalette: isEnabled(process.env.NEXT_PUBLIC_FEATURE_COMMAND_PALETTE),

	/** Core Web Vitals reporting (production-only by default). */
	webVitals: isEnabled(process.env.NEXT_PUBLIC_FEATURE_WEB_VITALS),

	/** "Back to top" floating button. */
	backToTop: isEnabled(process.env.NEXT_PUBLIC_FEATURE_BACK_TO_TOP),

	/** Keyboard shortcut help overlay (?). */
	shortcutHelp: isEnabled(process.env.NEXT_PUBLIC_FEATURE_SHORTCUT_HELP),

	/** RSS / Atom / JSON feed generation and footer links. */
	feeds: isEnabled(process.env.NEXT_PUBLIC_FEATURE_FEEDS),

	// New features

	/** Share buttons (copy link, Twitter/X, LinkedIn) on blog posts. */
	shareButtons: isEnabled(process.env.NEXT_PUBLIC_FEATURE_SHARE_BUTTONS),

	/** Emoji reactions (🔥 👍 🧠 💡) on blog posts, stored in localStorage. */
	postReactions: isEnabled(process.env.NEXT_PUBLIC_FEATURE_POST_REACTIONS),

	/** Reading list / bookmark system with localStorage persistence. */
	readingList: isEnabled(process.env.NEXT_PUBLIC_FEATURE_READING_LIST),

	/** /now page showing current activities. */
	nowPage: isEnabled(process.env.NEXT_PUBLIC_FEATURE_NOW_PAGE),

	/** /changelog page showing recent git commits. */
	changelog: isEnabled(process.env.NEXT_PUBLIC_FEATURE_CHANGELOG),

	/** /blog/tags page for cross-category tag browsing. */
	tagsBrowsing: isEnabled(process.env.NEXT_PUBLIC_FEATURE_TAGS_BROWSING),

	/** Blog stats dashboard on the home page. */
	postStats: isEnabled(process.env.NEXT_PUBLIC_FEATURE_POST_STATS),

	/** Newsletter subscribe form (Buttondown integration). */
	newsletter: isEnabled(process.env.NEXT_PUBLIC_FEATURE_NEWSLETTER),

	/** i18n language switcher (English / Vietnamese). */
	i18n: isEnabled(process.env.NEXT_PUBLIC_FEATURE_I18N),

	/** "Try it" playground links on code blocks. */
	interactiveCode: isEnabled(process.env.NEXT_PUBLIC_FEATURE_INTERACTIVE_CODE),
} as const;

export type FeatureFlag = keyof typeof features;
