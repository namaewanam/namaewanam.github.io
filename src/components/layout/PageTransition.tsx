'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isFirstMount = useRef(true);
	const [shouldAnimate, setShouldAnimate] = useState(false);

	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
			return;
		}
		setShouldAnimate(true);
	}, [pathname]);

	return (
		<div
			key={pathname}
			className={shouldAnimate ? 'page-transition' : undefined}
			onAnimationEnd={() => setShouldAnimate(false)}
		>
			{children}
		</div>
	);
}
