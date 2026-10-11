# HENOSIS : rapport de refonte

11 octobre 2026.

## Réalisé

Migration de React vers Astro 6.4.8 et TypeScript strict. Collections MDX/Zod ; six chambres définies par des tensions. Les six fragments initiaux sont explicitement à écrire. MONO est la seule œuvre présentée, avec URL et preuve.

Signature : les fragments dispersés se réunissent en un fuseau ; la thèse réservée apparaît ; au clic, les mêmes fragments deviennent les nœuds de la constellation. Chaque relation possède une phrase. Le graphe vient des collections, avec placement au build et affinage d3-force dans un Worker.

Canvas unique persistant, WebGPURenderer / repli WebGL2, shaders TSL, plaques en relief instanciées, grain calculé. SVG et texte complet sans JavaScript, sans GPU, en mouvement réduit et avec Save-Data. Navigation clavier et liste équivalente, zones tactiles agrandies.

Routes : accueil, constellation, six chambres, fragments et leurs pages, œuvres, à-propos, lecture intégrale, graph.json, llms.txt, RSS, sitemap et 404. Meta, canonical, Open Graph et Person JSON-LD. Polices variables Fontsource auto-hébergées et sous-ensembles français ; grec polytonique via Noto et unicode-range.

## Vérification

Astro check : zéro erreur, avertissement ou hint. Build statique réussi, 19 pages HTML et trois sorties de données. Playwright : 32 tests réussis, 0 échec. Captures desktop/mobile, zéro erreur de console dans la capture finale. Tests : navigation, canvas conservé, focus du graphe, axe sur toutes les pages, HTML sans JavaScript, GPU absent, repli WebGL2, mouvement réduit, Save-Data et largeurs 320/390/768/1440 px.

Lighthouse CI mobile, profil 4G simulé, un passage par page. Ordre : performance / accessibilité / bonnes pratiques / SEO. Scores de laboratoire, sans données terrain.

| Page | Scores | LCP | CLS |
| --- | --- | --- | --- |
| /henosis/ | 99 / 100 / 100 / 100 | 1.81 s | 0.00011 |
| /henosis/chambres/machines/ | 99 / 100 / 100 / 100 | 1.81 s | 0.00115 |
| /henosis/fragments/deleguer/ | 99 / 100 / 100 / 100 | 1.81 s | 0.00026 |
| /henosis/oeuvres/ | 99 / 100 / 100 / 100 | 1.96 s | 0.00001 |
| /henosis/lecture/ | 99 / 100 / 100 / 100 | 1.96 s | 0.00001 |

## Budgets et limites

- JavaScript critique : **7799 octets gzip**, budget 100 000. Le module GPU est séparé : 241879 octets gzip, chargé en différé après le premier rendu.
- LCP : 1,81 à 1,96 s sur les cinq pages mesurées ; CLS inférieur à 0,002.
- Interactions de laboratoire : maximum **56 ms** sous CPU ×4 ; ce n’est pas un INP issu de visiteurs réels.
- DPR limité à 2 sur ordinateur et 1,5 sur mobile, réduit si le FPS baisse ; pause hors écran et onglet masqué ; dispose des ressources.
- Le build signale la taille du chunk GPU différé et une précision de sourcemap du plugin de transitions Astro. Le check est propre ; Lighthouse CI passe.
- Astro 6 reste signalé par npm audit. Sharp 0.35.5 et esbuild 0.28.2 sont fixés par override. Les avis restants et la portée du déploiement statique sont documentés dans SECURITE.md. La migration à Astro 7 corrigé n’est pas faite contre le brief.
- La thèse manque encore. Le test d’unicité peut être vérifié sur le dispositif d’unification et ses relations ; sa formulation personnelle demande le texte de Samir.

## Contenu restant

Huit réponses précises : la thèse, six cas personnels pour les notes, l’origine du nom HENOK. Deux candidats hors de la liste des œuvres : arènes 3D et Hermes / Brain OS, en attente de liens et de rôle confirmé. Le RSS est valide mais vide tant qu’aucun fragment n’est publié.

La liste exacte est dans CONTENT_TODO.md.

## Livraison

Site : https://samirneo.github.io/henosis/
Dépôt : https://github.com/SAMIRneo/henosis

La vérification HTTP et SHA-256 du déploiement est ajoutée dans live-verification.json après publication.

## État de publication

Publication sur main et GitHub Pages explicitement autorisée par Samir le 11 octobre 2026. La vérification du workflow et des fichiers servis est consignée dans le rapport de livraison et live-verification.json.
