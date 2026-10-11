import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';
const chambres=defineCollection({loader:glob({pattern:'*.md',base:'./src/content/chambres'}),schema:z.object({title:z.string(),number:z.number().int().min(1).max(6),tension:z.string(),question:z.string(),description:z.string()})});
const fragments=defineCollection({loader:glob({pattern:'*.mdx',base:'./src/content/fragments'}),schema:z.object({title:z.string(),date:z.coerce.date(),chambres:z.array(z.string()).min(1),relates:z.array(z.object({slug:z.string(),why:z.string().min(15)})),status:z.enum(['a-ecrire','publie']),question:z.string()})});
const oeuvres=defineCollection({loader:glob({pattern:'*.md',base:'./src/content/oeuvres'}),schema:z.object({title:z.string(),url:z.url().refine(v=>v.startsWith('https://')),kind:z.string(),proof:z.string(),status:z.literal('verifie')})});
export const collections={chambres,fragments,oeuvres};
