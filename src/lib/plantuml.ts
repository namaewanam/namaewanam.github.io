import { deflateRaw } from 'pako';

const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

const LIGHT_THEME_BLOCK = `
skinparam backgroundColor #fbf7df
skinparam defaultFontName Helvetica
skinparam defaultFontSize 13
skinparam defaultFontColor #765023
skinparam shadowing false
skinparam roundcorner 10
skinparam ArrowColor #6b5c44
skinparam ArrowFontColor #765023
skinparam HyperlinkColor #f18231
skinparam HyperlinkUnderline false
skinparam packageStyle rectangle
skinparam componentStyle rectangle
skinparam rectangle {
  BackgroundColor #fef3d8
  BorderColor #d48a20
  FontColor #2a1f0e
  RoundCorner 12
}
skinparam participant {
  BackgroundColor #fef3d8
  BorderColor #d48a20
  FontColor #2a1f0e
}
skinparam actor {
  BackgroundColor #fef3d8
  BorderColor #d48a20
  FontColor #2a1f0e
}
skinparam database {
  BackgroundColor #fdf5e8
  BorderColor #d48a20
  FontColor #2a1f0e
}
skinparam note {
  BackgroundColor #fff8e8
  BorderColor #f18231
  FontColor #765023
  TextAlignment left
}
skinparam sequence {
  LifeLineBorderColor #d48a20
  LifeLineBackgroundColor #fdf5e8
  ParticipantBorderColor #d48a20
  ParticipantBackgroundColor #fef3d8
  ParticipantFontColor #2a1f0e
  ActorBorderColor #d48a20
  ActorBackgroundColor #fef3d8
  ActorFontColor #2a1f0e
  ArrowColor #6b5c44
  ArrowFontColor #765023
  BoxBorderColor #d48a20
  BoxBackgroundColor #fdf5e8
  GroupBorderColor #d48a20
  GroupBackgroundColor #fdf5e8
  GroupHeaderFontColor #2a1f0e
  DividerBackgroundColor #fef3d8
  DividerBorderColor #d48a20
  DividerFontColor #765023
}
`.trim();

const DARK_THEME_BLOCK = `
skinparam backgroundColor #24170f
skinparam defaultFontName Helvetica
skinparam defaultFontSize 13
skinparam defaultFontColor #f0ead6
skinparam shadowing false
skinparam roundcorner 10
skinparam ArrowColor #9c876a
skinparam ArrowFontColor #f0ead6
skinparam HyperlinkColor #fccb26
skinparam HyperlinkUnderline false
skinparam packageStyle rectangle
skinparam componentStyle rectangle
skinparam rectangle {
  BackgroundColor #3d2a18
  BorderColor #6b4c30
  FontColor #f0ead6
  RoundCorner 12
}
skinparam participant {
  BackgroundColor #3d2a18
  BorderColor #6b4c30
  FontColor #f0ead6
}
skinparam actor {
  BackgroundColor #3d2a18
  BorderColor #6b4c30
  FontColor #f0ead6
}
skinparam database {
  BackgroundColor #2e1e10
  BorderColor #6b4c30
  FontColor #f0ead6
}
skinparam note {
  BackgroundColor #2e1e10
  BorderColor #fccb26
  FontColor #f0ead6
  TextAlignment left
}
skinparam sequence {
  LifeLineBorderColor #6b4c30
  LifeLineBackgroundColor #2e1e10
  ParticipantBorderColor #6b4c30
  ParticipantBackgroundColor #3d2a18
  ParticipantFontColor #f0ead6
  ActorBorderColor #6b4c30
  ActorBackgroundColor #3d2a18
  ActorFontColor #f0ead6
  ArrowColor #9c876a
  ArrowFontColor #f0ead6
  BoxBorderColor #6b4c30
  BoxBackgroundColor #2e1e10
  GroupBorderColor #6b4c30
  GroupBackgroundColor #2e1e10
  GroupHeaderFontColor #f0ead6
  DividerBackgroundColor #3d2a18
  DividerBorderColor #9c876a
  DividerFontColor #fccb26
}
`.trim();

function encode6bit(value: number): string {
	return PLANTUML_ALPHABET[value & 0x3f] ?? '0';
}

function append3bytes(byte1: number, byte2: number, byte3: number): string {
	const chunk1 = byte1 >> 2;
	const chunk2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
	const chunk3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
	const chunk4 = byte3 & 0x3f;

	return encode6bit(chunk1) + encode6bit(chunk2) + encode6bit(chunk3) + encode6bit(chunk4);
}

export function encodePlantUmlSource(source: string): string {
	const compressed = deflateRaw(new TextEncoder().encode(source), { level: 9 });
	let encoded = '';

	for (let index = 0; index < compressed.length; index += 3) {
		encoded += append3bytes(
			compressed[index] ?? 0,
			compressed[index + 1] ?? 0,
			compressed[index + 2] ?? 0
		);
	}

	return encoded;
}

export function applyPlantUmlTheme(source: string, dark: boolean): string {
	const themeBlock = dark ? DARK_THEME_BLOCK : LIGHT_THEME_BLOCK;
	const trimmedSource = source.trim();

	if (!trimmedSource) return trimmedSource;

	const injectedDirectives = [
		/^\s*skinparam\s+maxMessageSize\b/im.test(trimmedSource)
			? null
			: 'skinparam maxMessageSize 150',
		/^\s*autonumber\b/im.test(trimmedSource) ? null : 'autonumber',
	]
		.filter(Boolean)
		.join('\n');

	const injectedBlock = injectedDirectives ? `${themeBlock}\n${injectedDirectives}` : themeBlock;

	return trimmedSource.replace(
		/^(@start[^\n\r]*)/i,
		(startDirective) => `${startDirective}\n${injectedBlock}\n`
	);
}

export function getPlantUmlSvgUrl(source: string, dark = false): string {
	const root = process.env.NEXT_PUBLIC_PLANTUML_SERVER_URL ?? 'https://www.plantuml.com/plantuml';
	const normalizedRoot = root.replace(/\/+$/, '');
	const encoded = encodePlantUmlSource(applyPlantUmlTheme(source, dark));

	return normalizedRoot.endsWith('/svg')
		? `${normalizedRoot}/${encoded}`
		: `${normalizedRoot}/svg/${encoded}`;
}
