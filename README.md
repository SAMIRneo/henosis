# HENOSIS

Samir / HENOK. Dispersion → unité → relations.

Site Astro 6 statique à [samirneo.github.io/henosis](https://samirneo.github.io/henosis/). MDX, collections Zod, Three.js WebGPURenderer / TSL, GSAP, Lenis, d3-force en Worker. Le contenu et le SVG fonctionnent sans JavaScript. React n’est pas installé.

## Développement

Node 24. Versions fixes, installation reproductible par lockfile.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run budget
npm run preview -- --port 4322
```

Si l’environnement interdit le dossier de configuration Astro, définir `ASTRO_TELEMETRY_DISABLED=1`.

## Contenu

- `src/content/chambres/*.md` : six tensions, sans catégories exclusives.
- `src/content/fragments/*.mdx` : notes datées, chambres et raisons des relations.
- `src/content/oeuvres/*.md` : œuvres réelles avec URL et preuve.
- `src/lib/graph.ts` : script de validation et placement déterministe du graphe au build.
- `CONTENT_TODO.md` : huit questions éditoriales et deux œuvres candidates non affichées.

Une nouvelle note et son frontmatter suffisent pour ajouter un nœud. Les références inconnues font échouer le build. Pour publier une note, remplacer sa consigne, définir sa date réelle et passer `status: publie`. Le RSS exclut les notes à écrire.

## Routes

`/`, `/constellation/`, `/chambres/[slug]/`, `/oeuvres/`, `/fragments/`, `/fragments/[slug]/`, `/a-propos/`, `/lecture/`, `/graph.json`, `/llms.txt`, `/rss.xml`, sitemap, 404. Préfixe `/henosis` appliqué partout.

## Tests

Serveur de production sur 4322, Microsoft Edge installé :

```sh
npm test
npm run lighthouse
```

Pour Lighthouse sur Windows, définir `CHROME_PATH` vers le navigateur Chromium installé. Tests : toutes les pages, axe, navigation, clavier, HTML sans JavaScript, canvas conservé, mouvement réduit, Save-Data, repli WebGL2, absence totale de GPU, 320/390/768/1440 px, sorties JSON/RSS/texte et 404. Les chemins de résultats peuvent être configurés dans `playwright.config.ts` et `lighthouserc.cjs`. Captures : `node tools/capture.mjs`, variables `HENOSIS_URL`, `HENOSIS_OUTPUT`.

## Déploiement

Action officielle `withastro/action@v5` puis `actions/deploy-pages@v4`. Le check TypeScript et le budget critique sont bloquants avant déploiement. Site statique, aucun endpoint serveur Astro exposé. Le canvas unique reste dans le layout via `transition:persist`; la lecture simple n’initialise pas le renderer.

## Documents

- `DECISIONS.md` : audit, choix et sources techniques.
- `docs/SPEC.md` : thèse réservée, schémas et format du graphe.
- `docs/BUDGET.json` : tailles mesurées du build.
- `docs/SECURITE.md` : avis npm et portée du déploiement statique.

## Images

`src/assets/veil.webp` provient des références fournies par Samir. Auteur original non renseigné ; signature conservée. Les AVIF sont générés par Astro. Aucun droit sur cette référence n’est revendiqué ni concédé.
