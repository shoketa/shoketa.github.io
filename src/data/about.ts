// Edit your about content here.

export const profile = {
	name: 'Allen Velazco',
	// Shown on hover. Spelled by sound, A-le-n Be-la-s-ko, with virama marks on the final consonants.
	nameBaybayin: 'ᜀᜎᜒᜈ᜔ ᜊᜒᜎᜐ᜔ᜃᜓ',
	// First syllable of each name: A, Be.
	initialsBaybayin: 'ᜀᜊᜒ',
	role: 'Junior Technical Artist',
	// Put the photo at public/portrait.jpg, then set this to '/portrait.jpg'.
	portrait: undefined as string | undefined,
	links: [
		{ label: 'E-Mail', href: 'mailto:allenvelazco@hotmail.com' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/' },
	],
};

export const resume = [
	{
		period: '2026 – present',
		role: 'Junior Technical Artist Intern',
		org: 'Massive Entertainment',
		href: 'https://www.massive.se/',
	},
	{
		period: '2025 – present',
		role: 'Technical Artist Student',
		org: 'The Game Assembly Malmö',
		href: 'https://thegameassembly.com/se/studerande/program-technical-artist/',
	},
];
