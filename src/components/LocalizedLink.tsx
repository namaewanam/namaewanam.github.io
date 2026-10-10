'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { AnchorHTMLAttributes, forwardRef } from 'react';

type LocalizedLinkProps = LinkProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
	({ href, ...rest }, ref) => {
		const pathname = usePathname();
		const isVi = pathname?.startsWith('/vi');
		const lang = isVi ? 'vi' : 'en';

		let finalHref = href;
		if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
			// Prevent double prefixing
			if (
				!href.startsWith('/en/') &&
				!href.startsWith('/vi/') &&
				href !== '/en' &&
				href !== '/vi'
			) {
				finalHref = `/${lang}${href === '/' ? '' : href}`;
			}
		}

		return <Link ref={ref} href={finalHref} {...rest} />;
	}
);

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;
