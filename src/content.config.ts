import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One markdown file per project. The file body is the project's breakdown page.
const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		year: z.string(),
		// One line: the result, not the process.
		summary: z.string(),
		tags: z.array(z.string()).default([]),
		// Paths under public/, e.g. /media/water.mp4 and /media/water.jpg
		video: z.string().optional(),
		poster: z.string().optional(),
		order: z.number().default(0),
		// Featured projects list under :: projects. :: breakdowns lists everything.
		featured: z.boolean().default(false),
	}),
});

export const collections = { projects };
