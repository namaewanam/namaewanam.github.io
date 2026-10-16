import type { Post } from '@/lib/markdown';
import {
	CONTACT_EMAIL,
	GITHUB_PROFILE_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
	toPostOgSlug,
} from '@/lib/site';

export function getPersonSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: SITE_NAME,
		url: `${SITE_URL}/`,
		email: CONTACT_EMAIL,
		jobTitle: 'Backend Engineer',
		sameAs: [GITHUB_PROFILE_URL, 'https://www.linkedin.com/in/ntnam'],
	};
}

export function getWebSiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: `${SITE_URL}/`,
		description: SITE_DESCRIPTION,
		inLanguage: ['en', 'vi'],
		author: {
			'@type': 'Person',
			name: SITE_NAME,
		},
	};
}

export function getBlogPostingSchema(post: Post, lang: string = 'en') {
	const postUrl = `${SITE_URL}/${lang}/blog/${post.category}/${post.fullPath}/`;
	const imageUrl = `${SITE_URL}/og/posts/${toPostOgSlug(post.category, post.fullPath)}.png`;

	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description || post.title,
		datePublished: post.date,
		dateModified: post.lastUpdated || post.date,
		url: postUrl,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': postUrl,
		},
		image: imageUrl,
		author: {
			'@type': 'Person',
			name: SITE_NAME,
			url: `${SITE_URL}/`,
		},
		publisher: {
			'@type': 'Person',
			name: SITE_NAME,
			url: `${SITE_URL}/`,
		},
		keywords: post.tags?.join(', '),
		articleSection: post.categoryName || post.category,
		inLanguage: lang,
	};
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}
