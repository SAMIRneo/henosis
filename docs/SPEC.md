# HENOSIS : spécification

## Thèse

`[À ÉCRIRE PAR SAMIR : en une phrase, quel lien unit ce que tu apprends et ce que tu construis ?]`

Sujet confirmé par le brief : Samir, HENOK, 22 ans, autodidacte et polymathe. Le dispositif décrit un geste : dispersion → unité → relations. Le mot grec ἕνωσις désigne ici l’unification, selon le sens donné par le brief.

## Collections

Schémas Zod dans `src/content.config.ts`, chargement `glob` natif Astro.

- `chambres/*.md` : title, number, tension, question, description.
- `fragments/*.mdx` : title, date, chambres[], relates[{slug, why}], status (`a-ecrire` ou `publie`), question. La date d’un brouillon indique sa préparation.
- `oeuvres/*.md` : title, url HTTPS, kind, proof, status (`verifie`). Aucune entrée fictive.

Limite de six chambres vérifiée au build. Les références sont validées avant toute sortie.

## Graphe

`src/lib/graph.ts` est le script de construction partagé. Il lit les collections, valide les références et calcule 300 itérations déterministes de d3-force. Les positions sont normalisées à un repère 1000 × 700. `/graph.json` est sa sortie statique, aussi incorporée dans le HTML pour éviter un fetch critique.

```ts
type Graph = {
 version: 1;
 nodes: { id: string; title: string; url: string; chambres: string[]; status: string; x: number; y: number }[];
 links: { id: string; source: string; target: string; why: string }[];
};
```

Le SVG et le rendu instancié utilisent ces mêmes nœuds. Le Worker reçoit des objets clonés et raffine les positions sans bloquer le thread principal. Le graphe affiché et ses explications textuelles restent disponibles sans Worker ou JavaScript.

## Routes

Accueil, constellation, six chambres, œuvres, fragments, chaque fragment, à-propos, lecture, graph.json, llms.txt, rss.xml, sitemap, 404. Toutes les URL internes passent par `href()` et le préfixe `/henosis`.

## Qualité

HTML statique complet, navigation native, ClientRouter, canvas persistant, liens explicables au survol/focus/toucher, liste équivalente. JS critique mesuré en gzip (budget 100 000 octets), bundle GPU séparé. Rendu différé, qualité adaptative, DPR ≤ 2/1,5, pause hors écran et onglet caché, arrêt et dispose au changement de préférences/pagehide. Tests Playwright, axe, Lighthouse CI ; scores réellement obtenus dans le rapport de livraison.
