import React from 'react';
import { ImageResponse } from 'next/og';

export const OG_IMAGE_SIZE = {
	width: 1200,
	height: 630,
} as const;

interface BuildOgImageOptions {
	eyebrow: string;
	title: string;
	description?: string;
	meta?: string;
	path?: string;
}

export function buildOgImage({
	eyebrow,
	title,
	description,
	meta = 'backend notes // systems // production',
	path = '~/nam',
}: Readonly<BuildOgImageOptions>) {
	return new ImageResponse(
		(
			<div
				style={{
					display: 'flex',
					width: '100%',
					height: '100%',
					background:
						'radial-gradient(circle at top right, rgba(252, 203, 38, 0.22), transparent 34%), linear-gradient(135deg, #faf7e2 0%, #f6efd4 100%)',
					color: '#6f4a1e',
					padding: '56px',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						width: '100%',
						height: '100%',
						border: '1px solid rgba(118, 80, 35, 0.18)',
						borderRadius: '24px',
						padding: '40px',
						background: 'rgba(255, 252, 244, 0.72)',
						boxShadow: '0 24px 80px rgba(118, 80, 35, 0.10)',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<div
							style={{
								display: 'flex',
								fontFamily: 'monospace',
								fontSize: 28,
								color: '#f18231',
							}}
						>
							~/nam
						</div>
						<div
							style={{
								display: 'flex',
								border: '1px solid rgba(118, 80, 35, 0.18)',
								borderRadius: '999px',
								padding: '8px 14px',
								fontFamily: 'monospace',
								fontSize: 18,
								color: '#8c6534',
								textTransform: 'uppercase',
								letterSpacing: '0.12em',
							}}
						>
							{eyebrow}
						</div>
					</div>

					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '20px',
							width: '100%',
						}}
					>
						<div
							style={{
								display: 'flex',
								fontFamily: 'monospace',
								fontSize: 20,
								color: '#a1763b',
								textTransform: 'uppercase',
								letterSpacing: '0.16em',
							}}
						>
							{meta}
						</div>
						<div
							style={{
								display: 'flex',
								maxWidth: '92%',
								fontSize: 64,
								lineHeight: 1.05,
								fontWeight: 700,
								color: '#6f4a1e',
							}}
						>
							{title}
						</div>
						{description ? (
							<div
								style={{
									display: 'flex',
									maxWidth: '78%',
									fontSize: 28,
									lineHeight: 1.35,
									color: '#886942',
								}}
							>
								{description}
							</div>
						) : null}
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
							fontFamily: 'monospace',
							fontSize: 22,
							color: '#8f6c3d',
						}}
					>
						<div style={{ display: 'flex' }}>{path}</div>
						<div style={{ display: 'flex' }}>ntnam1605.github.io</div>
					</div>
				</div>
			</div>
		),
		OG_IMAGE_SIZE
	);
}
