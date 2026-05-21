'use client';

import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';

declare global {
	interface Window {
		__WEB_VITALS__?: Array<{
			name: string;
			value: number;
			rating?: string;
			path: string;
			id: string;
		}>;
	}
}

export default function WebVitals({ debug = false }: Readonly<{ debug?: boolean }>) {
	const pathname = usePathname() ?? '/';

	useReportWebVitals((metric) => {
		const payload = {
			name: metric.name,
			value: metric.value,
			rating: 'rating' in metric ? metric.rating : undefined,
			path: pathname,
			id: metric.id,
		};

		window.__WEB_VITALS__ = [...(window.__WEB_VITALS__ ?? []), payload];
		if (debug) {
			console.info('[web-vitals]', payload);
		}
	});

	return null;
}
