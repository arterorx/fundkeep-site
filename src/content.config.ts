import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * Articles (SPEC §4, phase 3).
 *
 * `description` is capped at 155 here as well as in the build guard, because a
 * schema error names the file and the line, and a guard failure only names the
 * built page. Two nets, different mesh.
 *
 * `sourcesCheckedOn` is not decoration. These articles state facts about
 * somebody else's product — what YNAB charges, where its export lives, what
 * comes out of it — and those go stale quietly: nothing breaks, the page just
 * becomes wrong about a named company. The date makes the staleness visible
 * and the build warns once it is a year old.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    /** Shown as the article date, and used for sorting. */
    published: z.date(),
    updated: z.date().optional(),
    /** When the factual claims were last checked against their sources. */
    sourcesCheckedOn: z.date(),
    /** One line under the title. */
    standfirst: z.string(),
    /**
     * This article prints other companies' prices, so the build lets their
     * figures through on this page and nowhere else. Setting it is a promise
     * that every one of those figures came from a first-party source listed
     * in COMPETITORS — see the rule written there.
     */
    namesCompetitors: z.boolean().default(false),
  }),
});

export const collections = { blog };
